"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { competicaoSchema, type CompeticaoInput } from "@/lib/validations";
import { requireAuth } from "@/lib/auth-guard";
import type { ActionResult } from "@/lib/action-result";

export async function createCompeticao(data: CompeticaoInput): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = competicaoSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.competicao.create({ data: parsed.data });
  revalidatePath("/competicoes");
  return { success: true, mensagemSucesso: "Competição criada com sucesso." };
}

export async function updateCompeticao(
  id: string,
  data: CompeticaoInput,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = competicaoSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.competicao.update({ where: { id }, data: parsed.data });
  revalidatePath("/competicoes");
  return { success: true, mensagemSucesso: "Competição atualizada com sucesso." };
}

export async function deleteCompeticao(id: string): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await prisma.competicao.delete({ where: { id } });
  } catch {
    return {
      error:
        "Não foi possível excluir: existem resultados vinculados a esta competição.",
    };
  }

  revalidatePath("/competicoes");
  return { success: true, mensagemSucesso: "Competição excluída com sucesso." };
}
