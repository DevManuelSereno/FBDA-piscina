"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { clubeSchema } from "@/lib/validations";

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
  const parsed = parseClubeForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.clube.create({ data: parsed.data });
  } catch {
    return { error: "Já existe um clube com esse nome." };
  }

  revalidatePath("/clubes");
  return { success: true };
}

export async function updateClube(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseClubeForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.clube.update({ where: { id }, data: parsed.data });
  } catch {
    return { error: "Já existe um clube com esse nome." };
  }

  revalidatePath("/clubes");
  return { success: true };
}

export async function deleteClube(id: string): Promise<ActionResult> {
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
