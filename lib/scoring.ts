export type PosicaoPontos = { posicao: number; pontos: number };

export function calcularPontos(
  colocacao: number | null,
  tabela: PosicaoPontos[],
): number {
  if (colocacao === null) return 0;
  const regra = tabela.find((p) => p.posicao === colocacao);
  return regra?.pontos ?? 0;
}

export function validarPosicoes(posicoes: PosicaoPontos[]): string | null {
  if (posicoes.length === 0) {
    return "Adicione ao menos uma posição.";
  }

  const posicoesVistas = new Set<number>();
  for (const { posicao, pontos } of posicoes) {
    if (posicao < 1 || !Number.isInteger(posicao)) {
      return "A posição deve ser maior ou igual a 1.";
    }
    if (pontos < 0) {
      return "Os pontos não podem ser negativos.";
    }
    if (posicoesVistas.has(posicao)) {
      return "Existem posições duplicadas.";
    }
    posicoesVistas.add(posicao);
  }

  return null;
}
