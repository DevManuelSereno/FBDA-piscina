import { parseTime } from "./time";

export type ResultadoStatus = "VALIDO" | "DQ" | "DNS";

export type ParseResultadoInput = {
  status: ResultadoStatus;
  tempoRaw: string;
  colocacaoRaw: string;
};

export type ParseResultadoOutput =
  | {
      status: ResultadoStatus;
      tempoCentesimos: number | null;
      colocacao: number | null;
    }
  | { error: string };

export function parseResultadoInput(
  input: ParseResultadoInput,
): ParseResultadoOutput {
  if (input.status !== "VALIDO") {
    return { status: input.status, tempoCentesimos: null, colocacao: null };
  }

  const tempoRaw = input.tempoRaw.trim();
  if (!tempoRaw) {
    return { error: "Informe o tempo." };
  }

  let tempoCentesimos: number;
  try {
    tempoCentesimos = parseTime(tempoRaw);
  } catch {
    return { error: "Tempo inválido. Use mm:ss.cc." };
  }

  const colocacaoRaw = input.colocacaoRaw.trim();
  let colocacao: number | null = null;
  if (colocacaoRaw) {
    const valor = Number(colocacaoRaw);
    if (!Number.isInteger(valor) || valor < 1) {
      return { error: "Colocação inválida." };
    }
    colocacao = valor;
  }

  return { status: "VALIDO", tempoCentesimos, colocacao };
}

export function temColocacaoDuplicada(
  existentes: { atletaId: string; colocacao: number | null }[],
  atletaIdAtual: string,
  colocacaoAtual: number | null,
): boolean {
  if (colocacaoAtual === null) return false;
  return existentes.some(
    (r) => r.atletaId !== atletaIdAtual && r.colocacao === colocacaoAtual,
  );
}
