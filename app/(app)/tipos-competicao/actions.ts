"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { tipoCompeticaoSchema } from "@/lib/validations";
import { requireAuth } from "@/lib/auth-guard";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

export type ActionResult = { error?: string; success?: boolean };

function parseTipoCompeticaoForm(formData: FormData) {
  return tipoCompeticaoSchema.safeParse({
    nome: formData.get("nome"),
    circuitoId: formData.get("circuitoId"),
    metodoPontuacao: formData.get("metodoPontuacao"),
    grupoRelatorio: formData.get("grupoRelatorio"),
    ordem: formData.get("ordem"),
    regraPontuacaoId: formData.get("regraPontuacaoId"),
  });
}

export async function createTipoCompeticao(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = parseTipoCompeticaoForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.tipoCompeticao.create({
      data: {
        ...parsed.data,
        regraPontuacaoId: parsed.data.regraPontuacaoId ?? null,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe um tipo com esse nome neste circuito." };
    }
    console.error(error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/tipos-competicao");
  return { success: true };
}

export async function updateTipoCompeticao(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = parseTipoCompeticaoForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.tipoCompeticao.update({
      where: { id },
      data: {
        ...parsed.data,
        regraPontuacaoId: parsed.data.regraPontuacaoId ?? null,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe um tipo com esse nome neste circuito." };
    }
    console.error(error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/tipos-competicao");
  return { success: true };
}

export async function deleteTipoCompeticao(id: string): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await prisma.tipoCompeticao.delete({ where: { id } });
  } catch {
    return {
      error:
        "Não foi possível excluir: existem competições vinculadas a este tipo.",
    };
  }

  revalidatePath("/tipos-competicao");
  return { success: true };
}
