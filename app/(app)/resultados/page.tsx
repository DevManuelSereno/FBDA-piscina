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

  const [circuitos, provas] = await Promise.all([
    prisma.circuito.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
    }),
    prisma.prova.findMany({
      orderBy: [{ distancia: "asc" }, { nome: "asc" }],
    }),
  ]);

  // Sem circuito selecionado na URL, cai no primeiro ativo (menor ordem) —
  // a classificação por idade depende de um circuito estar sempre definido.
  const circuitoId = params.circuitoId || circuitos[0]?.id || "";
  const competicaoId = params.competicaoId ?? "";
  const provaId = params.provaId ?? "";

  // As competições ficam restritas ao circuito selecionado — só existe
  // esse vínculo desde a Etapa 10, via TipoCompeticao.
  const competicoes = circuitoId
    ? await prisma.competicao.findMany({
        where: { tipoCompeticao: { circuitoId } },
        include: { tipoCompeticao: true },
        orderBy: { data: "desc" },
      })
    : [];

  const competicao = competicoes.find((c) => c.id === competicaoId);
  const metodoPontuacao = competicao?.tipoCompeticao.metodoPontuacao ?? null;

  let linhas: LinhaResultado[] = [];

  if (circuitoId && competicaoId && provaId && metodoPontuacao === "COLOCACAO") {
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
        mostrarProva={metodoPontuacao === "COLOCACAO"}
      />

      {!circuitoId || !competicaoId ? (
        <div className="flex items-center gap-2 rounded-md border border-dashed p-6 text-muted-foreground">
          Selecione um circuito e uma competição acima para começar o
          lançamento.
        </div>
      ) : metodoPontuacao === "MANUAL" ? (
        <div className="flex items-center gap-2 rounded-md border border-dashed p-6 text-muted-foreground">
          Esta competição usa lançamento manual de pontuação (não por
          colocação em prova). Essa tela chega na próxima etapa.
        </div>
      ) : !provaId ? (
        <div className="flex items-center gap-2 rounded-md border border-dashed p-6 text-muted-foreground">
          Selecione uma prova acima para começar o lançamento.
        </div>
      ) : (
        <ResultadosGrid
          linhas={linhas}
          provaId={provaId}
          competicaoId={competicaoId}
          circuitoId={circuitoId}
        />
      )}
    </div>
  );
}
