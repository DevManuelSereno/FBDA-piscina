"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { atletaSchema, type AtletaInput } from "@/lib/validations";
import { requireAuth } from "@/lib/auth-guard";
import type { ActionResult } from "@/lib/action-result";

export async function createAtleta(data: AtletaInput): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = atletaSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.atleta.create({ data: parsed.data });
  revalidatePath("/atletas");
  return { success: true, mensagemSucesso: "Atleta criado com sucesso." };
}

export async function updateAtleta(
  id: string,
  data: AtletaInput,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = atletaSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.atleta.update({ where: { id }, data: parsed.data });
  revalidatePath("/atletas");
  return { success: true, mensagemSucesso: "Atleta atualizado com sucesso." };
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
  return { success: true, mensagemSucesso: "Atleta excluído com sucesso." };
}
