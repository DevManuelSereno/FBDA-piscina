"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { clubeSchema } from "@/lib/validations";
import { requireAuth } from "@/lib/auth-guard";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

export type ActionResult = { error?: string; success?: boolean };

function parseClubeForm(formData: FormData) {
  return clubeSchema.safeParse({
    nome: formData.get("nome"),
    sigla: formData.get("sigla"),
    cidade: formData.get("cidade"),
  });
}

export async function createClube(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = parseClubeForm(formData);
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
  return { success: true };
}

export async function updateClube(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = parseClubeForm(formData);
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
  return { success: true };
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
  return { success: true };
}
