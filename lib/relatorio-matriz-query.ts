import { prisma } from "./db";
import {
  montarMatriz,
  gruposOrdenados,
  type MatrizLinha,
} from "./relatorio-matriz";

export type FiltrosMatrizQuery = {
  circuitoId: string;
  sexo: string;
  temporada: string;
};

export type ColunaMatriz = { id: string; nome: string; grupoRelatorio: string };

export async function buscarMatriz(filtros: FiltrosMatrizQuery): Promise<{
  colunas: ColunaMatriz[];
  grupos: string[];
  linhas: MatrizLinha[];
}> {
  if (!filtros.circuitoId || !filtros.sexo) {
    return { colunas: [], grupos: [], linhas: [] };
  }

  const competicoes = await prisma.competicao.findMany({
    where: {
      tipoCompeticao: { circuitoId: filtros.circuitoId },
      ...(filtros.temporada ? { temporada: filtros.temporada } : {}),
    },
    include: { tipoCompeticao: true },
    orderBy: [{ tipoCompeticao: { ordem: "asc" } }, { data: "asc" }],
  });

  const colunas: ColunaMatriz[] = competicoes.map((c) => ({
    id: c.id,
    nome: c.nome,
    grupoRelatorio: c.tipoCompeticao.grupoRelatorio,
  }));

  const pontuacoes = await prisma.pontuacaoCompeticao.findMany({
    where: {
      competicaoId: { in: competicoes.map((c) => c.id) },
      atleta: { sexo: filtros.sexo },
    },
    include: { atleta: { include: { clube: true } }, categoria: true },
  });

  const pontuacoesParaMatriz = pontuacoes.map((p) => ({
    atletaId: p.atletaId,
    atletaNome: p.atleta.nomeCompleto,
    clubeNome: p.atleta.clube.nome,
    categoriaNome: p.categoria.nome,
    categoriaOrdem: p.categoria.ordem,
    competicaoId: p.competicaoId,
    pontos: p.pontos,
  }));

  return {
    colunas,
    grupos: gruposOrdenados(colunas),
    linhas: montarMatriz(pontuacoesParaMatriz, colunas),
  };
}
