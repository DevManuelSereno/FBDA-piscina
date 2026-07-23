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
      { posicao: 1, atletaId: "a1", atletaNome: "Ana", clubeNome: "Baía", pontos: 16 },
      { posicao: 2, atletaId: "a2", atletaNome: "Bruno", clubeNome: "Baía", pontos: 6 },
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

  test("atletas empatados em pontos recebem a mesma posição, e a próxima posição pula o empate", () => {
    const resultados: ResultadoParaRanking[] = [
      { atletaId: "a1", atletaNome: "Ana", clubeId: "c1", clubeNome: "Baía", pontos: 9 },
      { atletaId: "a2", atletaNome: "Bruno", clubeId: "c1", clubeNome: "Baía", pontos: 9 },
      { atletaId: "a3", atletaNome: "Carla", clubeId: "c1", clubeNome: "Baía", pontos: 5 },
    ];

    const ranking = agregarRankingIndividual(resultados);

    expect(ranking.map((r) => [r.posicao, r.pontos])).toEqual([
      [1, 9],
      [1, 9],
      [3, 5],
    ]);
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
      { posicao: 1, clubeId: "c1", clubeNome: "Baía", pontos: 16 },
      { posicao: 2, clubeId: "c2", clubeNome: "Golfinhos", pontos: 6 },
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

  test("clubes empatados em pontos recebem a mesma posição", () => {
    const resultados: ResultadoParaRanking[] = [
      { atletaId: "a1", atletaNome: "Ana", clubeId: "c1", clubeNome: "Baía", pontos: 10 },
      { atletaId: "a2", atletaNome: "Bruno", clubeId: "c2", clubeNome: "Golfinhos", pontos: 10 },
      { atletaId: "a3", atletaNome: "Carla", clubeId: "c3", clubeNome: "Municipal", pontos: 4 },
    ];

    const ranking = agregarRankingColetivo(resultados);

    expect(ranking.map((r) => [r.posicao, r.pontos])).toEqual([
      [1, 10],
      [1, 10],
      [3, 4],
    ]);
  });
});
