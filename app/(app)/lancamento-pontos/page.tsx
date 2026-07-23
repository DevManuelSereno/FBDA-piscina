import { prisma } from "@/lib/db";
import { inferirCategoria } from "@/lib/categoria";
import { SeletorCircuitoCompeticao } from "./seletor";
import { LancamentoGrid, type LinhaLancamento } from "./lancamento-grid";

export default async function LancamentoPontosPage({
  searchParams,
}: {
  searchParams: Promise<{ circuitoId?: string; competicaoId?: string }>;
}) {
  const params = await searchParams;

  const circuitos = await prisma.circuito.findMany({
    where: { ativo: true },
    orderBy: { ordem: "asc" },
  });

  const circuitoId = params.circuitoId || circuitos[0]?.id || "";
  const competicaoId = params.competicaoId ?? "";

  // Só competições MANUAL aparecem aqui — as COLOCACAO usam o grid de
  // provas em /resultados.
  const competicoes = circuitoId
    ? await prisma.competicao.findMany({
        where: {
          tipoCompeticao: { circuitoId, metodoPontuacao: "MANUAL" },
        },
        orderBy: { data: "desc" },
      })
    : [];

  const competicao = competicoes.find((c) => c.id === competicaoId);

  let linhas: LinhaLancamento[] = [];

  if (circuitoId && competicao) {
    const [atletas, categorias, pontuacoes] = await Promise.all([
      prisma.atleta.findMany({
        where: { ativo: true },
        orderBy: { nomeCompleto: "asc" },
        include: { clube: true },
      }),
      prisma.categoria.findMany(),
      prisma.pontuacaoCompeticao.findMany({ where: { competicaoId } }),
    ]);

    const pontuacaoPorAtleta = new Map(
      pontuacoes.map((p) => [p.atletaId, p]),
    );

    linhas = atletas.map((atleta) => {
      const categoria = inferirCategoria(
        atleta.dataNascimento,
        atleta.sexo,
        competicao.data,
        categorias,
        circuitoId,
      );
      const pontuacao = pontuacaoPorAtleta.get(atleta.id);

      return {
        atletaId: atleta.id,
        nomeCompleto: atleta.nomeCompleto,
        clubeNome: atleta.clube.nome,
        categoriaId: categoria?.id ?? null,
        categoriaLabel: categoria
          ? `${categoria.nome} (${categoria.sexo})`
          : "—",
        pontos: pontuacao?.pontos ?? null,
      };
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Lançamento de Pontos
        </h1>
        <p className="text-muted-foreground">
          Para competições com pontuação manual (Regional, Brasileiro,
          Fita Azul...): digite os pontos oficiais de cada atleta.
        </p>
      </div>

      <SeletorCircuitoCompeticao
        circuitos={circuitos}
        competicoes={competicoes}
        circuitoIdAtual={circuitoId}
        competicaoIdAtual={competicaoId}
      />

      {!circuitoId || !competicaoId ? (
        <div className="flex items-center gap-2 rounded-md border border-dashed p-6 text-muted-foreground">
          Selecione um circuito e uma competição acima para começar o
          lançamento.
        </div>
      ) : !competicao ? (
        <div className="flex items-center gap-2 rounded-md border border-dashed p-6 text-muted-foreground">
          Nenhuma competição de pontuação manual encontrada para esse
          circuito.
        </div>
      ) : (
        <LancamentoGrid
          linhas={linhas}
          competicaoId={competicaoId}
          circuitoId={circuitoId}
        />
      )}
    </div>
  );
}
