"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { calcularPontos, validarPosicoes, type PosicaoPontos } from "@/lib/scoring";
import { requireAuth } from "@/lib/auth-guard";

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

  const regraAtiva = await prisma.regraPontuacao.findFirst({
    where: { ativo: true },
    include: { posicoes: true },
  });
  if (!regraAtiva) {
    return { error: "Nenhuma regra de pontuação está ativa." };
  }

  const resultados = await prisma.resultado.findMany({
    where: { status: "VALIDO" },
  });

  await prisma.$transaction(
    resultados.map((resultado) =>
      prisma.resultado.update({
        where: { id: resultado.id },
        data: { pontos: calcularPontos(resultado.colocacao, regraAtiva.posicoes) },
      }),
    ),
  );

  revalidatePath("/resultados");
  revalidatePath("/pontuacao");
  return { success: true, atualizados: resultados.length };
}
