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
  const colocacao = colocacaoRaw ? Number(colocacaoRaw) : null;

  return { status: "VALIDO", tempoCentesimos, colocacao };
}
