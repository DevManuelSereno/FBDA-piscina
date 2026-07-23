import { describe, expect, test } from "vitest";
import { parseResultadoInput, temColocacaoDuplicada } from "./resultado";

describe("parseResultadoInput", () => {
  test("status VALIDO com tempo válido retorna tempoCentesimos e colocacao", () => {
    const resultado = parseResultadoInput({
      status: "VALIDO",
      tempoRaw: "01:02.45",
      colocacaoRaw: "1",
    });
    expect(resultado).toEqual({
      status: "VALIDO",
      tempoCentesimos: 6245,
      colocacao: 1,
    });
  });

  test("status VALIDO sem tempo retorna erro", () => {
    const resultado = parseResultadoInput({
      status: "VALIDO",
      tempoRaw: "",
      colocacaoRaw: "1",
    });
    expect(resultado).toEqual({ error: "Informe o tempo." });
  });

  test("status VALIDO com tempo em formato inválido retorna erro", () => {
    const resultado = parseResultadoInput({
      status: "VALIDO",
      tempoRaw: "abc",
      colocacaoRaw: "",
    });
    expect(resultado).toEqual({ error: "Tempo inválido. Use mm:ss.cc." });
  });

  test("status VALIDO sem colocacao é permitido (colocacao null)", () => {
    const resultado = parseResultadoInput({
      status: "VALIDO",
      tempoRaw: "30.00",
      colocacaoRaw: "",
    });
    expect(resultado).toEqual({
      status: "VALIDO",
      tempoCentesimos: 3000,
      colocacao: null,
    });
  });

  test("status DQ zera tempo e colocacao mesmo se preenchidos", () => {
    const resultado = parseResultadoInput({
      status: "DQ",
      tempoRaw: "30.00",
      colocacaoRaw: "2",
    });
    expect(resultado).toEqual({
      status: "DQ",
      tempoCentesimos: null,
      colocacao: null,
    });
  });

  test("status DNS zera tempo e colocacao", () => {
    const resultado = parseResultadoInput({
      status: "DNS",
      tempoRaw: "",
      colocacaoRaw: "",
    });
    expect(resultado).toEqual({
      status: "DNS",
      tempoCentesimos: null,
      colocacao: null,
    });
  });

  test("status VALIDO com colocacao não numérica retorna erro", () => {
    const resultado = parseResultadoInput({
      status: "VALIDO",
      tempoRaw: "30.00",
      colocacaoRaw: "abc",
    });
    expect(resultado).toEqual({ error: "Colocação inválida." });
  });

  test("status VALIDO com colocacao decimal retorna erro", () => {
    const resultado = parseResultadoInput({
      status: "VALIDO",
      tempoRaw: "30.00",
      colocacaoRaw: "1.5",
    });
    expect(resultado).toEqual({ error: "Colocação inválida." });
  });

  test("status VALIDO com colocacao zero ou negativa retorna erro", () => {
    expect(
      parseResultadoInput({
        status: "VALIDO",
        tempoRaw: "30.00",
        colocacaoRaw: "0",
      }),
    ).toEqual({ error: "Colocação inválida." });
    expect(
      parseResultadoInput({
        status: "VALIDO",
        tempoRaw: "30.00",
        colocacaoRaw: "-1",
      }),
    ).toEqual({ error: "Colocação inválida." });
  });
});

describe("temColocacaoDuplicada", () => {
  test("retorna true quando outro atleta já ocupa a mesma colocação", () => {
    const existentes = [
      { atletaId: "a1", colocacao: 1 },
      { atletaId: "a2", colocacao: 2 },
    ];
    expect(temColocacaoDuplicada(existentes, "a3", 1)).toBe(true);
  });

  test("retorna false quando a colocação é do próprio atleta sendo salvo", () => {
    const existentes = [
      { atletaId: "a1", colocacao: 1 },
      { atletaId: "a2", colocacao: 2 },
    ];
    expect(temColocacaoDuplicada(existentes, "a1", 1)).toBe(false);
  });

  test("retorna false quando colocacao é null", () => {
    const existentes = [{ atletaId: "a1", colocacao: 1 }];
    expect(temColocacaoDuplicada(existentes, "a3", null)).toBe(false);
  });

  test("retorna false quando não há conflito", () => {
    const existentes = [{ atletaId: "a1", colocacao: 1 }];
    expect(temColocacaoDuplicada(existentes, "a3", 2)).toBe(false);
  });
});
