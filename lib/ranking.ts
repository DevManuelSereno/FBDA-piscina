export type ResultadoParaRanking = {
  atletaId: string;
  atletaNome: string;
  clubeId: string;
  clubeNome: string;
  pontos: number;
};

export type RankingIndividualItem = {
  atletaId: string;
  atletaNome: string;
  clubeNome: string;
  pontos: number;
};

export type RankingColetivoItem = {
  clubeId: string;
  clubeNome: string;
  pontos: number;
};

export function agregarRankingIndividual(
  resultados: ResultadoParaRanking[],
): RankingIndividualItem[] {
  const mapa = new Map<string, RankingIndividualItem>();

  for (const resultado of resultados) {
    const atual = mapa.get(resultado.atletaId);
    if (atual) {
      atual.pontos += resultado.pontos;
    } else {
      mapa.set(resultado.atletaId, {
        atletaId: resultado.atletaId,
        atletaNome: resultado.atletaNome,
        clubeNome: resultado.clubeNome,
        pontos: resultado.pontos,
      });
    }
  }

  return [...mapa.values()].sort((a, b) => b.pontos - a.pontos);
}

export function agregarRankingColetivo(
  resultados: ResultadoParaRanking[],
): RankingColetivoItem[] {
  const mapa = new Map<string, RankingColetivoItem>();

  for (const resultado of resultados) {
    const atual = mapa.get(resultado.clubeId);
    if (atual) {
      atual.pontos += resultado.pontos;
    } else {
      mapa.set(resultado.clubeId, {
        clubeId: resultado.clubeId,
        clubeNome: resultado.clubeNome,
        pontos: resultado.pontos,
      });
    }
  }

  return [...mapa.values()].sort((a, b) => b.pontos - a.pontos);
}
