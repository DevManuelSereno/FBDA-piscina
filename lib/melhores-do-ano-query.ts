import { prisma } from "./db";
import type { Prisma } from "./generated/prisma/client";
import {
  bonusRecordeMelhoresDoAno,
  calcularMelhoresDoAno,
  type ItemParaMelhoresDoAno,
  type MelhoresDoAnoColetivoItem,
  type MelhoresDoAnoIndividualItem,
} from "./melhores-do-ano";

export type FiltrosMelhoresDoAnoQuery = {
  circuitoId: string;
  temporada: string;
};

export async function buscarMelhoresDoAno(
  filtros: FiltrosMelhoresDoAnoQuery,
): Promise<{
  individual: MelhoresDoAnoIndividualItem[];
  coletivo: MelhoresDoAnoColetivoItem[];
}> {
  const where: Prisma.PontuacaoCompeticaoWhereInput = {};
  if (filtros.temporada) {
    where.competicao = { temporada: filtros.temporada };
  }
  if (filtros.circuitoId) {
    where.categoria = { circuitoId: filtros.circuitoId };
  }

  const pontuacoes = await prisma.pontuacaoCompeticao.findMany({
    where,
    include: {
      atleta: { include: { clube: true } },
      competicao: { include: { tipoCompeticao: true } },
    },
  });

  // Bônus de recorde (escala própria do Melhores do Ano, ver
  // lib/melhores-do-ano.ts) — só existe em Resultado, que só é preenchido
  // para competições COLOCACAO (Concurso).
  const competicaoIds = [...new Set(pontuacoes.map((p) => p.competicaoId))];
  const resultadosComRecorde = await prisma.resultado.findMany({
    where: { competicaoId: { in: competicaoIds }, recordeTipo: { not: null } },
    select: { atletaId: true, competicaoId: true, recordeTipo: true },
  });
  const bonusPorAtletaCompeticao = new Map<string, number>();
  for (const r of resultadosComRecorde) {
    const bonus = bonusRecordeMelhoresDoAno(r.recordeTipo);
    if (bonus === 0) continue;
    const chave = `${r.atletaId}:${r.competicaoId}`;
    bonusPorAtletaCompeticao.set(
      chave,
      (bonusPorAtletaCompeticao.get(chave) ?? 0) + bonus,
    );
  }

  const itens: ItemParaMelhoresDoAno[] = pontuacoes.map((p) => ({
    competicaoId: p.competicaoId,
    categoriaId: p.categoriaId,
    atletaId: p.atletaId,
    atletaNome: p.atleta.nomeCompleto,
    clubeId: p.atleta.clubeId,
    clubeNome: p.atleta.clube.nome,
    pontosCompeticao: p.pontos,
    grupoRelatorio: p.competicao.tipoCompeticao.grupoRelatorio,
    bonusRecorde: bonusPorAtletaCompeticao.get(`${p.atletaId}:${p.competicaoId}`) ?? 0,
  }));

  return calcularMelhoresDoAno(itens);
}
