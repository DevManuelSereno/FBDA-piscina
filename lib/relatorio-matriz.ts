export type CompeticaoMatriz = {
  id: string;
  nome: string;
  grupoRelatorio: string;
};

// Fonte única dos grupos de relatório válidos — usada pelo select do
// formulário de TipoCompeticao (evita texto livre digitado errado
// fragmentar o agrupamento do relatório) e pela exibição do rótulo
// legível na tela e no PDF.
export const GRUPOS_RELATORIO = [
  { value: "CONCURSO", label: "Concursos" },
  { value: "CAMPEONATO", label: "Campeonatos" },
  { value: "REGIONAL", label: "Regionais" },
  { value: "BRASILEIRO_CATEGORIAS", label: "Brasileiro de Categorias" },
  { value: "BRASILEIRO_ABSOLUTO", label: "Brasileiro Absoluto" },
  { value: "FITA_AZUL", label: "Fita Azul" },
] as const;

const LABEL_GRUPO: Record<string, string> = Object.fromEntries(
  GRUPOS_RELATORIO.map((g) => [g.value, g.label]),
);

export const GRUPOS_RELATORIO_VALORES = GRUPOS_RELATORIO.map(
  (g) => g.value,
) as [string, ...string[]];

export function labelGrupo(grupo: string): string {
  return LABEL_GRUPO[grupo] ?? grupo;
}

export type PontuacaoParaMatriz = {
  atletaId: string;
  atletaNome: string;
  clubeNome: string;
  categoriaNome: string;
  categoriaOrdem: number;
  competicaoId: string;
  pontos: number;
};

export type MatrizLinha = {
  atletaId: string;
  atletaNome: string;
  clubeNome: string;
  categoriaNome: string;
  categoriaOrdem: number;
  pontosPorCompeticao: Record<string, number>;
  subtotaisPorGrupo: Record<string, number>;
  total: number;
};

// Monta a matriz atleta × competição (linhas) a partir do rollup
// PontuacaoCompeticao — mesmo formato do relatório que o cliente já usa
// em planilha (colunas agrupadas por tipo, com subtotal por grupo e
// total geral).
export function montarMatriz(
  pontuacoes: PontuacaoParaMatriz[],
  competicoes: CompeticaoMatriz[],
): MatrizLinha[] {
  const grupoPorCompeticao = new Map(
    competicoes.map((c) => [c.id, c.grupoRelatorio]),
  );
  const linhasPorAtleta = new Map<string, MatrizLinha>();

  for (const p of pontuacoes) {
    let linha = linhasPorAtleta.get(p.atletaId);
    if (!linha) {
      linha = {
        atletaId: p.atletaId,
        atletaNome: p.atletaNome,
        clubeNome: p.clubeNome,
        categoriaNome: p.categoriaNome,
        categoriaOrdem: p.categoriaOrdem,
        pontosPorCompeticao: {},
        subtotaisPorGrupo: {},
        total: 0,
      };
      linhasPorAtleta.set(p.atletaId, linha);
    }

    linha.pontosPorCompeticao[p.competicaoId] =
      (linha.pontosPorCompeticao[p.competicaoId] ?? 0) + p.pontos;
    linha.total += p.pontos;

    const grupo = grupoPorCompeticao.get(p.competicaoId);
    if (grupo) {
      linha.subtotaisPorGrupo[grupo] =
        (linha.subtotaisPorGrupo[grupo] ?? 0) + p.pontos;
    }
  }

  return [...linhasPorAtleta.values()].sort((a, b) => {
    if (a.categoriaOrdem !== b.categoriaOrdem) {
      return a.categoriaOrdem - b.categoriaOrdem;
    }
    return b.total - a.total;
  });
}

// Extrai os grupos de relatório únicos, na ordem de aparição das
// competições (que já vêm ordenadas por TipoCompeticao.ordem) — usada
// para montar os cabeçalhos de grupo (colspan) da matriz.
export function gruposOrdenados(competicoes: CompeticaoMatriz[]): string[] {
  const vistos = new Set<string>();
  const grupos: string[] = [];
  for (const c of competicoes) {
    if (!vistos.has(c.grupoRelatorio)) {
      vistos.add(c.grupoRelatorio);
      grupos.push(c.grupoRelatorio);
    }
  }
  return grupos;
}
