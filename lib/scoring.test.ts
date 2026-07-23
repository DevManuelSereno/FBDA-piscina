import { describe, expect, test } from "vitest";
import { calcularPontos, validarPosicoes, type PosicaoPontos } from "./scoring";

describe("calcularPontos", () => {
  const tabela: PosicaoPontos[] = [
    { posicao: 1, pontos: 9 },
    { posicao: 2, pontos: 7 },
    { posicao: 3, pontos: 6 },
  ];

  test("retorna os pontos da posição correspondente", () => {
    expect(calcularPontos(1, tabela)).toBe(9);
    expect(calcularPontos(2, tabela)).toBe(7);
  });

  test("retorna 0 quando a colocação não tem pontuação definida", () => {
    expect(calcularPontos(4, tabela)).toBe(0);
  });

  test("retorna 0 quando a colocação é null (DQ/DNS)", () => {
    expect(calcularPontos(null, tabela)).toBe(0);
  });
});

describe("validarPosicoes", () => {
  test("aceita uma lista válida", () => {
    const erro = validarPosicoes([
      { posicao: 1, pontos: 9 },
      { posicao: 2, pontos: 7 },
    ]);
    expect(erro).toBeNull();
  });

  test("rejeita lista vazia", () => {
    const erro = validarPosicoes([]);
    expect(erro).toBe("Adicione ao menos uma posição.");
  });

  test("rejeita posições duplicadas", () => {
    const erro = validarPosicoes([
      { posicao: 1, pontos: 9 },
      { posicao: 1, pontos: 7 },
    ]);
    expect(erro).toBe("Existem posições duplicadas.");
  });

  test("rejeita posição menor que 1", () => {
    const erro = validarPosicoes([{ posicao: 0, pontos: 9 }]);
    expect(erro).toBe("A posição deve ser maior ou igual a 1.");
  });

  test("rejeita pontos negativos", () => {
    const erro = validarPosicoes([{ posicao: 1, pontos: -1 }]);
    expect(erro).toBe("Os pontos não podem ser negativos.");
  });
});
