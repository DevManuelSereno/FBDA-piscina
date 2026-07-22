import { describe, expect, test } from "vitest";
import { parseResultadoInput } from "./resultado";

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
});
