"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { provaSchema, type ProvaInput } from "@/lib/validations";
import { requireAuth } from "@/lib/auth-guard";
import { isUniqueConstraintError } from "@/lib/prisma-errors";
import type { ActionResult } from "@/lib/action-result";

export async function createProva(data: ProvaInput): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = provaSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.prova.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe uma prova com esses dados." };
    }
    console.error(error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/provas");
  return { success: true, mensagemSucesso: "Prova criada com sucesso." };
}

export async function updateProva(
  id: string,
  data: ProvaInput,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = provaSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.prova.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe uma prova com esses dados." };
    }
    console.error(error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/provas");
  return { success: true, mensagemSucesso: "Prova atualizada com sucesso." };
}

export async function deleteProva(id: string): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await prisma.prova.delete({ where: { id } });
  } catch {
    return {
      error:
        "Não foi possível excluir: existem resultados vinculados a esta prova.",
    };
  }

  revalidatePath("/provas");
  return { success: true, mensagemSucesso: "Prova excluída com sucesso." };
}
