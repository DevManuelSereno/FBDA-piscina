"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { clubeSchema, type ClubeInput } from "@/lib/validations";
import { requireAuth } from "@/lib/auth-guard";
import { isUniqueConstraintError } from "@/lib/prisma-errors";
import type { ActionResult } from "@/lib/action-result";

export async function createClube(data: ClubeInput): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = clubeSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.clube.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe um clube com esse nome." };
    }
    console.error(error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/clubes");
  return { success: true, mensagemSucesso: "Clube criado com sucesso." };
}

export async function updateClube(
  id: string,
  data: ClubeInput,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = clubeSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.clube.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe um clube com esse nome." };
    }
    console.error(error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/clubes");
  return { success: true, mensagemSucesso: "Clube atualizado com sucesso." };
}

export async function deleteClube(id: string): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await prisma.clube.delete({ where: { id } });
  } catch {
    return {
      error:
        "Não foi possível excluir: existem atletas vinculados a este clube.",
    };
  }

  revalidatePath("/clubes");
  return { success: true, mensagemSucesso: "Clube excluído com sucesso." };
}
