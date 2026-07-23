export type ResultadoParaRanking = {
  atletaId: string;
  atletaNome: string;
  clubeId: string;
  clubeNome: string;
  pontos: number;
};

export type RankingIndividualItem = {
  posicao: number;
  atletaId: string;
  atletaNome: string;
  clubeNome: string;
  pontos: number;
};

export type RankingColetivoItem = {
  posicao: number;
  clubeId: string;
  clubeNome: string;
  pontos: number;
};

// Ranking "padrão de competição": itens empatados em pontos recebem a
// mesma posição, e a próxima posição pula o número de itens empatados
// (ex.: 1, 1, 3, 4 — não 1, 1, 2, 3). Assume `itens` já ordenado por
// pontos decrescente.
function atribuirPosicoes<T extends { pontos: number }>(
  itens: T[],
): (T & { posicao: number })[] {
  const resultado: (T & { posicao: number })[] = [];

  for (let index = 0; index < itens.length; index++) {
    const empatadoComAnterior =
      index > 0 && itens[index - 1].pontos === itens[index].pontos;
    const posicao = empatadoComAnterior
      ? resultado[index - 1].posicao
      : index + 1;
    resultado.push({ ...itens[index], posicao });
  }

  return resultado;
}

export function agregarRankingIndividual(
  resultados: ResultadoParaRanking[],
): RankingIndividualItem[] {
  const mapa = new Map<string, Omit<RankingIndividualItem, "posicao">>();

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

  const ordenado = [...mapa.values()].sort((a, b) => b.pontos - a.pontos);
  return atribuirPosicoes(ordenado);
}

export function agregarRankingColetivo(
  resultados: ResultadoParaRanking[],
): RankingColetivoItem[] {
  const mapa = new Map<string, Omit<RankingColetivoItem, "posicao">>();

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

  const ordenado = [...mapa.values()].sort((a, b) => b.pontos - a.pontos);
  return atribuirPosicoes(ordenado);
}
