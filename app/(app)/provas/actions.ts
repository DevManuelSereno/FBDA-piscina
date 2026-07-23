"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { provaSchema } from "@/lib/validations";
import { requireAuth } from "@/lib/auth-guard";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

export type ActionResult = { error?: string; success?: boolean };

function parseProvaForm(formData: FormData) {
  return provaSchema.safeParse({
    nome: formData.get("nome"),
    estilo: formData.get("estilo"),
    distancia: formData.get("distancia"),
    piscina: formData.get("piscina"),
  });
}

export async function createProva(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = parseProvaForm(formData);
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
  return { success: true };
}

export async function updateProva(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = parseProvaForm(formData);
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
  return { success: true };
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
  return { success: true };
}
