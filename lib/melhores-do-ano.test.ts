import { describe, expect, test } from "vitest";
import {
  bonusRecordeMelhoresDoAno,
  calcularMelhoresDoAno,
  type ItemParaMelhoresDoAno,
} from "./melhores-do-ano";

describe("bonusRecordeMelhoresDoAno", () => {
  test("retorna 0 quando não há recorde", () => {
    expect(bonusRecordeMelhoresDoAno(null)).toBe(0);
  });

  test("retorna 20 para qualquer recorde Baiano", () => {
    expect(bonusRecordeMelhoresDoAno("Baiano Absoluto")).toBe(20);
    expect(bonusRecordeMelhoresDoAno("Baiano de Classe")).toBe(20);
    expect(bonusRecordeMelhoresDoAno("Baiano")).toBe(20);
  });

  test("retorna 50 para qualquer recorde Brasileiro", () => {
    expect(bonusRecordeMelhoresDoAno("Brasileiro Absoluto")).toBe(50);
    expect(bonusRecordeMelhoresDoAno("Brasileiro")).toBe(50);
  });

  test("retorna 0 para recordes fora do escopo deste artigo (Sul-Americano/Mundial)", () => {
    expect(bonusRecordeMelhoresDoAno("Sul-Americano Absoluto")).toBe(0);
    expect(bonusRecordeMelhoresDoAno("Mundial")).toBe(0);
  });
});

describe("calcularMelhoresDoAno", () => {
  function item(overrides: Partial<ItemParaMelhoresDoAno>): ItemParaMelhoresDoAno {
    return {
      competicaoId: "comp1",
      categoriaId: "cat1",
      atletaId: "a1",
      atletaNome: "Ana",
      clubeId: "c1",
      clubeNome: "Baía",
      pontosCompeticao: 0,
      grupoRelatorio: "CONCURSO",
      bonusRecorde: 0,
      ...overrides,
    };
  }

  test("usa a escala do nível (CONCURSO = 5-4-3-2-1) conforme a colocação dentro da competição", () => {
    const itens = [
      item({ atletaId: "a1", atletaNome: "Ana", pontosCompeticao: 25 }),
      item({ atletaId: "a2", atletaNome: "Bruno", clubeId: "c2", clubeNome: "Golfinhos", pontosCompeticao: 20 }),
    ];

    const { individual } = calcularMelhoresDoAno(itens);

    expect(individual).toEqual([
      { posicao: 1, atletaId: "a1", atletaNome: "Ana", clubeNome: "Baía", pontos: 5 },
      { posicao: 2, atletaId: "a2", atletaNome: "Bruno", clubeNome: "Golfinhos", pontos: 4 },
    ]);
  });

  test("usa a escala de um nível maior (REGIONAL = 30-24-18-12-6)", () => {
    const itens = [item({ grupoRelatorio: "REGIONAL", pontosCompeticao: 100 })];

    const { individual } = calcularMelhoresDoAno(itens);

    expect(individual[0].pontos).toBe(30);
  });

  test("colocação acima da 5ª não pontua", () => {
    const itens = Array.from({ length: 6 }, (_, i) =>
      item({
        atletaId: `a${i}`,
        atletaNome: `Atleta ${i}`,
        pontosCompeticao: 100 - i,
      }),
    );

    const { individual } = calcularMelhoresDoAno(itens);

    expect(individual.find((i) => i.atletaId === "a5")?.pontos).toBe(0);
  });

  test("grupoRelatorio sem mapeamento (ex.: FITA_AZUL) não pontua pelo nível", () => {
    const itens = [item({ grupoRelatorio: "FITA_AZUL", pontosCompeticao: 999 })];

    const { individual } = calcularMelhoresDoAno(itens);

    expect(individual[0].pontos).toBe(0);
  });

  test("bônus de recorde é somado independente da colocação no nível", () => {
    const itens = [item({ pontosCompeticao: 10, bonusRecorde: 20 })];

    const { individual } = calcularMelhoresDoAno(itens);

    // 1º lugar em CONCURSO (5 pts) + bônus de recorde (20 pts) = 25.
    expect(individual[0].pontos).toBe(25);
  });

  test("soma pontos do mesmo atleta em competições diferentes", () => {
    const itens = [
      item({ competicaoId: "comp1", pontosCompeticao: 25 }),
      item({ competicaoId: "comp2", pontosCompeticao: 25 }),
    ];

    const { individual } = calcularMelhoresDoAno(itens);

    // 1º lugar em cada uma das 2 competições = 5 + 5 = 10.
    expect(individual[0].pontos).toBe(10);
  });

  test("agrega o ranking coletivo somando os pontos dos atletas do mesmo clube", () => {
    const itens = [
      item({ atletaId: "a1", atletaNome: "Ana", clubeId: "c1", clubeNome: "Baía", pontosCompeticao: 25 }),
      item({
        competicaoId: "comp2",
        atletaId: "a2",
        atletaNome: "Bruno",
        clubeId: "c1",
        clubeNome: "Baía",
        pontosCompeticao: 25,
      }),
    ];

    const { coletivo } = calcularMelhoresDoAno(itens);

    expect(coletivo).toEqual([{ posicao: 1, clubeId: "c1", clubeNome: "Baía", pontos: 10 }]);
  });

  test("categorias diferentes na mesma competição são ranqueadas separadamente", () => {
    const itens = [
      item({ categoriaId: "cat1", atletaId: "a1", pontosCompeticao: 10 }),
      item({ categoriaId: "cat2", atletaId: "a2", pontosCompeticao: 5 }),
    ];

    const { individual } = calcularMelhoresDoAno(itens);

    // Ambos são 1º lugar nas suas respectivas categorias (5 pts cada).
    expect(individual.find((i) => i.atletaId === "a1")?.pontos).toBe(5);
    expect(individual.find((i) => i.atletaId === "a2")?.pontos).toBe(5);
  });

  test("retorna listas vazias quando não há itens", () => {
    expect(calcularMelhoresDoAno([])).toEqual({ individual: [], coletivo: [] });
  });
});
