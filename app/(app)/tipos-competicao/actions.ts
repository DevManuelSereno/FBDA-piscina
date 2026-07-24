"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { tipoCompeticaoSchema, type TipoCompeticaoInput } from "@/lib/validations";
import { requireAuth } from "@/lib/auth-guard";
import { isUniqueConstraintError } from "@/lib/prisma-errors";
import type { ActionResult } from "@/lib/action-result";

export async function createTipoCompeticao(
  data: TipoCompeticaoInput,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = tipoCompeticaoSchema.safeParse(data);
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
  return { success: true, mensagemSucesso: "Tipo de competição criado com sucesso." };
}

export async function updateTipoCompeticao(
  id: string,
  data: TipoCompeticaoInput,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = tipoCompeticaoSchema.safeParse(data);
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
  return { success: true, mensagemSucesso: "Tipo de competição atualizado com sucesso." };
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
  return { success: true, mensagemSucesso: "Tipo de competição excluído com sucesso." };
}
