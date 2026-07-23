import { prisma } from "./db";
import type { Prisma } from "./generated/prisma/client";
import {
  agregarRankingColetivo,
  agregarRankingIndividual,
  type RankingColetivoItem,
  type RankingIndividualItem,
} from "./ranking";

export type FiltrosRankingQuery = {
  tipo: "completo" | "provisorio";
  circuitoId: string;
  competicaoId: string;
  categoriaId: string;
  clubeId: string;
  sexo: string;
  temporada: string;
};

export async function buscarRanking(filtros: FiltrosRankingQuery): Promise<{
  individual: RankingIndividualItem[];
  coletivo: RankingColetivoItem[];
}> {
  // Fonte única do ranking: PontuacaoCompeticao (rollup por atleta x
  // competição), preenchida tanto para competições COLOCACAO (derivada de
  // Resultado) quanto MANUAL (digitada em /lancamento-pontos).
  const where: Prisma.PontuacaoCompeticaoWhereInput = {};

  if (filtros.tipo === "provisorio" && filtros.competicaoId) {
    where.competicaoId = filtros.competicaoId;
  }
  if (filtros.tipo === "completo" && filtros.temporada) {
    where.competicao = { temporada: filtros.temporada };
  }
  if (filtros.categoriaId) {
    where.categoriaId = filtros.categoriaId;
  } else if (filtros.circuitoId) {
    // Sem categoria específica, ainda assim não misturamos circuitos —
    // cada circuito é um ranking independente.
    where.categoria = { circuitoId: filtros.circuitoId };
  }

  const atletaWhere: Prisma.AtletaWhereInput = {};
  if (filtros.clubeId) {
    atletaWhere.clubeId = filtros.clubeId;
  }
  if (filtros.sexo) {
    atletaWhere.sexo = filtros.sexo;
  }
  if (Object.keys(atletaWhere).length > 0) {
    where.atleta = atletaWhere;
  }

  const pontuacoes = await prisma.pontuacaoCompeticao.findMany({
    where,
    include: { atleta: { include: { clube: true } } },
  });

  const resultadosParaRanking = pontuacoes.map((pontuacao) => ({
    atletaId: pontuacao.atletaId,
    atletaNome: pontuacao.atleta.nomeCompleto,
    clubeId: pontuacao.atleta.clubeId,
    clubeNome: pontuacao.atleta.clube.nome,
    pontos: pontuacao.pontos,
  }));

  return {
    individual: agregarRankingIndividual(resultadosParaRanking),
    coletivo: agregarRankingColetivo(resultadosParaRanking),
  };
}
