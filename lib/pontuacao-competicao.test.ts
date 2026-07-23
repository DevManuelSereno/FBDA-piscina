import { describe, expect, test } from "vitest";
import {
  calcularPontosCompeticao,
  parsePontosManual,
} from "./pontuacao-competicao";

describe("calcularPontosCompeticao", () => {
  test("soma os pontos de todos os resultados do atleta na competição", () => {
    const resultados = [{ pontos: 9 }, { pontos: 7 }, { pontos: 0 }];
    expect(calcularPontosCompeticao(resultados)).toBe(16);
  });

  test("retorna 0 quando não há resultados", () => {
    expect(calcularPontosCompeticao([])).toBe(0);
  });
});

describe("parsePontosManual", () => {
  test("aceita um número não-negativo", () => {
    expect(parsePontosManual("57")).toEqual({ pontos: 57 });
  });

  test("aceita ponto flutuante", () => {
    expect(parsePontosManual("57.5")).toEqual({ pontos: 57.5 });
  });

  test("aceita zero", () => {
    expect(parsePontosManual("0")).toEqual({ pontos: 0 });
  });

  test("retorna erro quando vazio", () => {
    expect(parsePontosManual("")).toEqual({ error: "Informe os pontos." });
  });

  test("retorna erro quando negativo", () => {
    expect(parsePontosManual("-5")).toEqual({ error: "Pontos inválidos." });
  });

  test("retorna erro quando não-numérico", () => {
    expect(parsePontosManual("abc")).toEqual({ error: "Pontos inválidos." });
  });
});
