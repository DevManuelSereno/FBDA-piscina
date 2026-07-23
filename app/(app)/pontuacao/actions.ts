"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { calcularPontos, validarPosicoes, type PosicaoPontos } from "@/lib/scoring";
import { requireAuth } from "@/lib/auth-guard";
import { calcularPontosCompeticao } from "@/lib/pontuacao-competicao";

export type ActionResult = { error?: string; success?: boolean };

export async function createRegra(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const nome = String(formData.get("nome") ?? "").trim();
  const tipo = formData.get("tipo");
  if (!nome) {
    return { error: "Informe o nome da regra." };
  }
  if (tipo !== "COLOCACAO" && tipo !== "FINA") {
    return { error: "Selecione o tipo da regra." };
  }

  await prisma.regraPontuacao.create({
    data: { nome, tipo, ativo: false },
  });

  revalidatePath("/pontuacao");
  return { success: true };
}

export async function ativarRegra(id: string): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  await prisma.$transaction([
    prisma.regraPontuacao.updateMany({ where: {}, data: { ativo: false } }),
    prisma.regraPontuacao.update({ where: { id }, data: { ativo: true } }),
  ]);

  revalidatePath("/pontuacao");
  return { success: true };
}

export async function deleteRegra(id: string): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const regra = await prisma.regraPontuacao.findUnique({ where: { id } });
  if (regra?.ativo) {
    return {
      error: "Não é possível excluir a regra ativa. Ative outra regra antes.",
    };
  }

  await prisma.regraPontuacao.delete({ where: { id } });
  revalidatePath("/pontuacao");
  return { success: true };
}

export async function salvarPosicoes(
  regraId: string,
  posicoes: PosicaoPontos[],
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const erro = validarPosicoes(posicoes);
  if (erro) {
    return { error: erro };
  }

  await prisma.$transaction([
    prisma.pontuacaoPosicao.deleteMany({ where: { regraId } }),
    prisma.pontuacaoPosicao.createMany({
      data: posicoes.map((p) => ({
        regraId,
        posicao: p.posicao,
        pontos: p.pontos,
      })),
    }),
  ]);

  revalidatePath("/pontuacao");
  return { success: true };
}

export async function recalcularRanking(): Promise<
  ActionResult & { atualizados?: number }
> {
  const authError = await requireAuth();
  if (authError) return authError;

  // Cada resultado usa a regra do TipoCompeticao da própria competição
  // (não mais uma única regra "ativa" global) — mesma resolução usada em
  // salvarResultado (app/(app)/resultados/actions.ts).
  const resultados = await prisma.resultado.findMany({
    where: { status: "VALIDO" },
    include: {
      competicao: {
        include: { tipoCompeticao: { include: { regraPontuacao: { include: { posicoes: true } } } } },
      },
    },
  });

  await prisma.$transaction(
    resultados.map((resultado) => {
      const regra = resultado.competicao.tipoCompeticao.regraPontuacao;
      const pontos = regra ? calcularPontos(resultado.colocacao, regra.posicoes) : 0;
      return prisma.resultado.update({
        where: { id: resultado.id },
        data: { pontos },
      });
    }),
  );

  // Reconstrói o rollup PontuacaoCompeticao (fonte do ranking) a partir
  // dos pontos recém-recalculados, agrupando por atleta+competição.
  const todosResultados = await prisma.resultado.findMany({
    select: { atletaId: true, competicaoId: true, categoriaId: true, pontos: true },
  });
  const grupos = new Map<
    string,
    { atletaId: string; competicaoId: string; categoriaId: string; itens: { pontos: number }[] }
  >();
  for (const r of todosResultados) {
    const chave = `${r.atletaId}:${r.competicaoId}`;
    const atual = grupos.get(chave);
    if (atual) {
      atual.itens.push({ pontos: r.pontos });
    } else {
      grupos.set(chave, {
        atletaId: r.atletaId,
        competicaoId: r.competicaoId,
        categoriaId: r.categoriaId,
        itens: [{ pontos: r.pontos }],
      });
    }
  }

  await prisma.$transaction(
    [...grupos.values()].map((g) => {
      const pontos = calcularPontosCompeticao(g.itens);
      return prisma.pontuacaoCompeticao.upsert({
        where: {
          atletaId_competicaoId: {
            atletaId: g.atletaId,
            competicaoId: g.competicaoId,
          },
        },
        create: {
          atletaId: g.atletaId,
          competicaoId: g.competicaoId,
          categoriaId: g.categoriaId,
          pontos,
          origem: "CALCULADO",
        },
        update: { categoriaId: g.categoriaId, pontos, origem: "CALCULADO" },
      });
    }),
  );

  revalidatePath("/resultados");
  revalidatePath("/pontuacao");
  revalidatePath("/ranking");
  return { success: true, atualizados: resultados.length };
}
