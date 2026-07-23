export function calcularPontosCompeticao(
  resultados: { pontos: number }[],
): number {
  return resultados.reduce((total, r) => total + r.pontos, 0);
}

export type ParsePontosManualOutput = { pontos: number } | { error: string };

export function parsePontosManual(pontosRaw: string): ParsePontosManualOutput {
  const raw = pontosRaw.trim();
  if (!raw) {
    return { error: "Informe os pontos." };
  }

  const valor = Number(raw);
  if (!Number.isFinite(valor) || valor < 0) {
    return { error: "Pontos inválidos." };
  }

  return { pontos: valor };
}
