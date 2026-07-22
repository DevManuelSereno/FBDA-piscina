"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { competicaoSchema } from "@/lib/validations";

export type ActionResult = { error?: string; success?: boolean };

function parseCompeticaoForm(formData: FormData) {
  return competicaoSchema.safeParse({
    nome: formData.get("nome"),
    data: formData.get("data"),
    local: formData.get("local"),
    temporada: formData.get("temporada"),
  });
}

export async function createCompeticao(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseCompeticaoForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.competicao.create({ data: parsed.data });
  revalidatePath("/competicoes");
  return { success: true };
}

export async function updateCompeticao(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseCompeticaoForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.competicao.update({ where: { id }, data: parsed.data });
  revalidatePath("/competicoes");
  return { success: true };
}

export async function deleteCompeticao(id: string): Promise<ActionResult> {
  try {
    await prisma.competicao.delete({ where: { id } });
  } catch {
    return {
      error:
        "Não foi possível excluir: existem resultados vinculados a esta competição.",
    };
  }

  revalidatePath("/competicoes");
  return { success: true };
}
