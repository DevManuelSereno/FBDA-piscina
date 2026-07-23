import { prisma } from "@/lib/db";
import { agregarRankingColetivo, agregarRankingIndividual } from "@/lib/ranking";
import type { Prisma } from "@/lib/generated/prisma/client";
import { FiltrosRanking, type FiltrosRankingValores } from "./filtros";
import { RankingIndividualTable } from "./ranking-individual-table";
import { RankingColetivoTable } from "./ranking-coletivo-table";

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const valores: FiltrosRankingValores = {
    tipo: params.tipo === "provisorio" ? "provisorio" : "completo",
    competicaoId: params.competicaoId ?? "",
    categoriaId: params.categoriaId ?? "",
    clubeId: params.clubeId ?? "",
    sexo: params.sexo ?? "",
    temporada: params.temporada ?? "",
  };

  const [competicoes, categorias, clubes, temporadasRaw] = await Promise.all([
    prisma.competicao.findMany({ orderBy: { data: "desc" } }),
    prisma.categoria.findMany({ orderBy: [{ idadeMin: "asc" }, { sexo: "asc" }] }),
    prisma.clube.findMany({ orderBy: { nome: "asc" } }),
    prisma.competicao.findMany({
      distinct: ["temporada"],
      select: { temporada: true },
    }),
  ]);
  const temporadas = temporadasRaw
    .map((t) => t.temporada)
    .filter((t): t is string => !!t);

  const where: Prisma.ResultadoWhereInput = { status: "VALIDO" };

  if (valores.tipo === "provisorio" && valores.competicaoId) {
    where.competicaoId = valores.competicaoId;
  }
  if (valores.tipo === "completo" && valores.temporada) {
    where.competicao = { temporada: valores.temporada };
  }
  if (valores.categoriaId) {
    where.categoriaId = valores.categoriaId;
  }
  const atletaWhere: Prisma.AtletaWhereInput = {};
  if (valores.clubeId) {
    atletaWhere.clubeId = valores.clubeId;
  }
  if (valores.sexo) {
    atletaWhere.sexo = valores.sexo;
  }
  if (Object.keys(atletaWhere).length > 0) {
    where.atleta = atletaWhere;
  }

  const resultados = await prisma.resultado.findMany({
    where,
    include: { atleta: { include: { clube: true } } },
  });

  const resultadosParaRanking = resultados.map((resultado) => ({
    atletaId: resultado.atletaId,
    atletaNome: resultado.atleta.nomeCompleto,
    clubeId: resultado.atleta.clubeId,
    clubeNome: resultado.atleta.clube.nome,
    pontos: resultado.pontos,
  }));

  const rankingIndividual = agregarRankingIndividual(resultadosParaRanking);
  const rankingColetivo = agregarRankingColetivo(resultadosParaRanking);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ranking</h1>
        <p className="text-muted-foreground">
          Classificação individual e coletiva com base nos resultados
          lançados.
        </p>
      </div>

      <FiltrosRanking
        valores={valores}
        competicoes={competicoes}
        categorias={categorias}
        clubes={clubes}
        temporadas={temporadas}
      />

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ranking Individual</h2>
        <RankingIndividualTable itens={rankingIndividual} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ranking Coletivo (por Clube)</h2>
        <RankingColetivoTable itens={rankingColetivo} />
      </div>
    </div>
  );
}
