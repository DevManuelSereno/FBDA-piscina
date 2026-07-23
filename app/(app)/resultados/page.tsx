import { prisma } from "@/lib/db";
import { inferirCategoria } from "@/lib/categoria";
import { SeletorCompeticaoProva } from "./seletor";
import { ResultadosGrid, type LinhaResultado } from "./resultados-grid";

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: Promise<{
    circuitoId?: string;
    competicaoId?: string;
    provaId?: string;
  }>;
}) {
  const params = await searchParams;

  const [circuitos, competicoes, provas] = await Promise.all([
    prisma.circuito.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
    }),
    prisma.competicao.findMany({ orderBy: { data: "desc" } }),
    prisma.prova.findMany({
      orderBy: [{ distancia: "asc" }, { nome: "asc" }],
    }),
  ]);

  // Sem circuito selecionado na URL, cai no primeiro ativo (menor ordem) —
  // a classificação por idade depende de um circuito estar sempre definido.
  const circuitoId = params.circuitoId || circuitos[0]?.id || "";
  const competicaoId = params.competicaoId ?? "";
  const provaId = params.provaId ?? "";

  let linhas: LinhaResultado[] = [];

  if (circuitoId && competicaoId && provaId) {
    const competicao = competicoes.find((c) => c.id === competicaoId);
    const [atletas, categorias, resultados] = await Promise.all([
      prisma.atleta.findMany({
        where: { ativo: true },
        orderBy: { nomeCompleto: "asc" },
        include: { clube: true },
      }),
      prisma.categoria.findMany(),
      prisma.resultado.findMany({ where: { competicaoId, provaId } }),
    ]);

    const resultadoPorAtleta = new Map(
      resultados.map((resultado) => [resultado.atletaId, resultado]),
    );

    linhas = atletas.map((atleta) => {
      const categoria = inferirCategoria(
        atleta.dataNascimento,
        atleta.sexo,
        competicao?.data ?? new Date(),
        categorias,
        circuitoId,
      );
      const resultado = resultadoPorAtleta.get(atleta.id);

      return {
        atletaId: atleta.id,
        nomeCompleto: atleta.nomeCompleto,
        clubeNome: atleta.clube.nome,
        categoriaId: categoria?.id ?? null,
        categoriaLabel: categoria
          ? `${categoria.nome} (${categoria.sexo})`
          : "—",
        status: (resultado?.status as LinhaResultado["status"]) ?? "VALIDO",
        tempoCentesimos: resultado?.tempoCentesimos ?? null,
        colocacao: resultado?.colocacao ?? null,
      };
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Lançamento de Resultados
        </h1>
        <p className="text-muted-foreground">
          Selecione o circuito, a competição e a prova para digitar os tempos.
        </p>
      </div>

      <SeletorCompeticaoProva
        circuitos={circuitos}
        competicoes={competicoes}
        provas={provas}
        circuitoIdAtual={circuitoId}
        competicaoIdAtual={competicaoId}
        provaIdAtual={provaId}
      />

      {circuitoId && competicaoId && provaId ? (
        <ResultadosGrid
          linhas={linhas}
          provaId={provaId}
          competicaoId={competicaoId}
          circuitoId={circuitoId}
        />
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-dashed p-6 text-muted-foreground">
          Selecione um circuito, uma competição e uma prova acima para
          começar o lançamento.
        </div>
      )}
    </div>
  );
}
