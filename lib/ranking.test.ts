import { describe, expect, test } from "vitest";
import {
  agregarRankingIndividual,
  agregarRankingColetivo,
  type ResultadoParaRanking,
} from "./ranking";

describe("agregarRankingIndividual", () => {
  test("soma os pontos do mesmo atleta em provas diferentes", () => {
    const resultados: ResultadoParaRanking[] = [
      { atletaId: "a1", atletaNome: "Ana", clubeId: "c1", clubeNome: "Baía", pontos: 9 },
      { atletaId: "a1", atletaNome: "Ana", clubeId: "c1", clubeNome: "Baía", pontos: 7 },
      { atletaId: "a2", atletaNome: "Bruno", clubeId: "c1", clubeNome: "Baía", pontos: 6 },
    ];

    const ranking = agregarRankingIndividual(resultados);

    expect(ranking).toEqual([
      { atletaId: "a1", atletaNome: "Ana", clubeNome: "Baía", pontos: 16 },
      { atletaId: "a2", atletaNome: "Bruno", clubeNome: "Baía", pontos: 6 },
    ]);
  });

  test("ordena do maior para o menor número de pontos", () => {
    const resultados: ResultadoParaRanking[] = [
      { atletaId: "a1", atletaNome: "Ana", clubeId: "c1", clubeNome: "Baía", pontos: 3 },
      { atletaId: "a2", atletaNome: "Bruno", clubeId: "c1", clubeNome: "Baía", pontos: 9 },
    ];

    const ranking = agregarRankingIndividual(resultados);

    expect(ranking.map((r) => r.atletaId)).toEqual(["a2", "a1"]);
  });

  test("retorna lista vazia quando não há resultados", () => {
    expect(agregarRankingIndividual([])).toEqual([]);
  });
});

describe("agregarRankingColetivo", () => {
  test("soma os pontos de todos os atletas do mesmo clube", () => {
    const resultados: ResultadoParaRanking[] = [
      { atletaId: "a1", atletaNome: "Ana", clubeId: "c1", clubeNome: "Baía", pontos: 9 },
      { atletaId: "a2", atletaNome: "Bruno", clubeId: "c1", clubeNome: "Baía", pontos: 7 },
      { atletaId: "a3", atletaNome: "Carla", clubeId: "c2", clubeNome: "Golfinhos", pontos: 6 },
    ];

    const ranking = agregarRankingColetivo(resultados);

    expect(ranking).toEqual([
      { clubeId: "c1", clubeNome: "Baía", pontos: 16 },
      { clubeId: "c2", clubeNome: "Golfinhos", pontos: 6 },
    ]);
  });

  test("ordena do maior para o menor número de pontos", () => {
    const resultados: ResultadoParaRanking[] = [
      { atletaId: "a1", atletaNome: "Ana", clubeId: "c1", clubeNome: "Baía", pontos: 3 },
      { atletaId: "a2", atletaNome: "Bruno", clubeId: "c2", clubeNome: "Golfinhos", pontos: 9 },
    ];

    const ranking = agregarRankingColetivo(resultados);

    expect(ranking.map((r) => r.clubeId)).toEqual(["c2", "c1"]);
  });

  test("retorna lista vazia quando não há resultados", () => {
    expect(agregarRankingColetivo([])).toEqual([]);
  });
});
