"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { atletaSchema } from "@/lib/validations";
import { requireAuth } from "@/lib/auth-guard";

export type ActionResult = { error?: string; success?: boolean };

function parseAtletaForm(formData: FormData) {
  return atletaSchema.safeParse({
    nomeCompleto: formData.get("nomeCompleto"),
    dataNascimento: formData.get("dataNascimento"),
    sexo: formData.get("sexo"),
    clubeId: formData.get("clubeId"),
    ativo: formData.get("ativo") === "on",
    numero: formData.get("numero"),
  });
}

export async function createAtleta(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = parseAtletaForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.atleta.create({ data: parsed.data });
  revalidatePath("/atletas");
  return { success: true };
}

export async function updateAtleta(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = parseAtletaForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.atleta.update({ where: { id }, data: parsed.data });
  revalidatePath("/atletas");
  return { success: true };
}

export async function deleteAtleta(id: string): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await prisma.atleta.delete({ where: { id } });
  } catch {
    return {
      error:
        "Não foi possível excluir: existem resultados vinculados a este atleta.",
    };
  }

  revalidatePath("/atletas");
  return { success: true };
}
