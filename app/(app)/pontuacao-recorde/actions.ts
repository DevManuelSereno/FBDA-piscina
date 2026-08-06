"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import type { ActionResult } from "@/lib/action-result";
import type { PontuacaoRecordeItem } from "@/lib/scoring";

export async function salvarRecordes(
  circuitoId: string,
  itens: PontuacaoRecordeItem[],
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const nomes = new Set<string>();
  for (const item of itens) {
    if (nomes.has(item.tipoRecorde)) {
      return { error: `Tipo de recorde duplicado: "${item.tipoRecorde}".` };
    }
    nomes.add(item.tipoRecorde);
  }

  await prisma.$transaction([
    prisma.pontuacaoRecorde.deleteMany({ where: { circuitoId } }),
    prisma.pontuacaoRecorde.createMany({
      data: itens.map((item, index) => ({
        circuitoId,
        tipoRecorde: item.tipoRecorde,
        pontos: item.pontos,
        ordem: index + 1,
      })),
    }),
  ]);

  revalidatePath("/pontuacao-recorde");
  revalidatePath("/resultados");
  return { success: true, mensagemSucesso: "Bônus de recorde salvos com sucesso." };
}
