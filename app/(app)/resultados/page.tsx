import { prisma } from "@/lib/db";
import { inferirCategoria } from "@/lib/categoria";
import { SeletorCompeticaoProva } from "./seletor";
import { ResultadosGrid, type LinhaResultado } from "./resultados-grid";

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: Promise<{ competicaoId?: string; provaId?: string }>;
}) {
  const params = await searchParams;
  const competicaoId = params.competicaoId ?? "";
  const provaId = params.provaId ?? "";

  const [competicoes, provas] = await Promise.all([
    prisma.competicao.findMany({ orderBy: { data: "desc" } }),
    prisma.prova.findMany({
      orderBy: [{ distancia: "asc" }, { nome: "asc" }],
    }),
  ]);

  let linhas: LinhaResultado[] = [];

  if (competicaoId && provaId) {
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
          Selecione a competição e a prova para digitar os tempos.
        </p>
      </div>

      <SeletorCompeticaoProva
        competicoes={competicoes}
        provas={provas}
        competicaoIdAtual={competicaoId}
        provaIdAtual={provaId}
      />

      {competicaoId && provaId ? (
        <ResultadosGrid
          linhas={linhas}
          provaId={provaId}
          competicaoId={competicaoId}
        />
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-dashed p-6 text-muted-foreground">
          Selecione uma competição e uma prova acima para começar o
          lançamento.
        </div>
      )}
    </div>
  );
}
