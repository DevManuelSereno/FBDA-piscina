import { describe, expect, test } from "vitest";
import { montarMatriz, type PontuacaoParaMatriz } from "./relatorio-matriz";

describe("montarMatriz", () => {
  const competicoes = [
    { id: "c1", nome: "1º Concurso", grupoRelatorio: "CONCURSO" },
    { id: "c2", nome: "2º Concurso", grupoRelatorio: "CONCURSO" },
    { id: "c3", nome: "Outono", grupoRelatorio: "CAMPEONATO" },
  ];

  test("agrupa pontos por competição, calcula subtotais por grupo e total", () => {
    const pontuacoes: PontuacaoParaMatriz[] = [
      {
        atletaId: "a1",
        atletaNome: "Ana",
        clubeNome: "Baía",
        categoriaNome: "INF1",
        categoriaOrdem: 1,
        competicaoId: "c1",
        pontos: 9,
      },
      {
        atletaId: "a1",
        atletaNome: "Ana",
        clubeNome: "Baía",
        categoriaNome: "INF1",
        categoriaOrdem: 1,
        competicaoId: "c2",
        pontos: 7,
      },
      {
        atletaId: "a1",
        atletaNome: "Ana",
        clubeNome: "Baía",
        categoriaNome: "INF1",
        categoriaOrdem: 1,
        competicaoId: "c3",
        pontos: 90,
      },
    ];

    const matriz = montarMatriz(pontuacoes, competicoes);

    expect(matriz).toEqual([
      {
        atletaId: "a1",
        atletaNome: "Ana",
        clubeNome: "Baía",
        categoriaNome: "INF1",
        categoriaOrdem: 1,
        pontosPorCompeticao: { c1: 9, c2: 7, c3: 90 },
        subtotaisPorGrupo: { CONCURSO: 16, CAMPEONATO: 90 },
        total: 106,
      },
    ]);
  });

  test("ordena por ordem da categoria e, dentro dela, por total decrescente", () => {
    const pontuacoes: PontuacaoParaMatriz[] = [
      {
        atletaId: "a1",
        atletaNome: "Ana",
        clubeNome: "Baía",
        categoriaNome: "SR",
        categoriaOrdem: 7,
        competicaoId: "c1",
        pontos: 20,
      },
      {
        atletaId: "a2",
        atletaNome: "Bruno",
        clubeNome: "Baía",
        categoriaNome: "INF1",
        categoriaOrdem: 1,
        competicaoId: "c1",
        pontos: 5,
      },
      {
        atletaId: "a3",
        atletaNome: "Carla",
        clubeNome: "Baía",
        categoriaNome: "INF1",
        categoriaOrdem: 1,
        competicaoId: "c1",
        pontos: 15,
      },
    ];

    const matriz = montarMatriz(pontuacoes, competicoes);

    expect(matriz.map((l) => l.atletaId)).toEqual(["a3", "a2", "a1"]);
  });

  test("retorna lista vazia quando não há pontuações", () => {
    expect(montarMatriz([], competicoes)).toEqual([]);
  });

  test("ignora grupoRelatorio de competição desconhecida", () => {
    const pontuacoes: PontuacaoParaMatriz[] = [
      {
        atletaId: "a1",
        atletaNome: "Ana",
        clubeNome: "Baía",
        categoriaNome: "INF1",
        categoriaOrdem: 1,
        competicaoId: "desconhecida",
        pontos: 5,
      },
    ];

    const matriz = montarMatriz(pontuacoes, competicoes);

    expect(matriz[0].subtotaisPorGrupo).toEqual({});
    expect(matriz[0].total).toBe(5);
  });
});

describe("gruposOrdenados", () => {
  test("extrai grupos únicos na ordem de aparição das competições", async () => {
    const { gruposOrdenados } = await import("./relatorio-matriz");
    const competicoes = [
      { id: "c1", nome: "1º Concurso", grupoRelatorio: "CONCURSO" },
      { id: "c2", nome: "2º Concurso", grupoRelatorio: "CONCURSO" },
      { id: "c3", nome: "Outono", grupoRelatorio: "CAMPEONATO" },
      { id: "c4", nome: "Regional Sul", grupoRelatorio: "REGIONAL" },
    ];

    expect(gruposOrdenados(competicoes)).toEqual([
      "CONCURSO",
      "CAMPEONATO",
      "REGIONAL",
    ]);
  });
});
