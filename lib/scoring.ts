export type PosicaoPontos = { posicao: number; pontos: number };

export function calcularPontos(
  colocacao: number | null,
  tabela: PosicaoPontos[],
): number {
  if (colocacao === null) return 0;
  const regra = tabela.find((p) => p.posicao === colocacao);
  return regra?.pontos ?? 0;
}

// Resolve qual RegraPontuacao usar para uma competição, considerando o
// local (Art. 15º, §1º/§2º do Regulamento Geral 2026: mesma colocação vale
// pontuação diferente dentro ou fora de Salvador). Se a competição é fora
// de Salvador e o TipoCompeticao tem uma regra específica para isso, usa
// essa; caso contrário cai na regra padrão (comportamento de antes desta
// distinção existir, retrocompatível com tipos de competição sem a regra
// alternativa configurada).
export function resolverRegraPorLocal<T>(
  localTipo: string,
  regraPontuacao: T | null,
  regraPontuacaoFora: T | null,
): T | null {
  if (localTipo === "FORA" && regraPontuacaoFora) {
    return regraPontuacaoFora;
  }
  return regraPontuacao;
}

export type PontuacaoRecordeItem = { tipoRecorde: string; pontos: number };

// Bônus de pontos por recorde batido (Art. 15º §3º do Regulamento Geral /
// equivalente no Regulamento Master), somado à pontuação de colocação.
// `recorde` é o tipoRecorde marcado no Resultado; `recordes` é a lista de
// bônus configurados para o circuito daquela competição.
export function calcularBonusRecorde(
  recordeTipo: string | null,
  recordes: PontuacaoRecordeItem[],
): number {
  if (!recordeTipo) return 0;
  return recordes.find((r) => r.tipoRecorde === recordeTipo)?.pontos ?? 0;
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
