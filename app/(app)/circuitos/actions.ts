"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { circuitoSchema, type CircuitoInput } from "@/lib/validations";
import { requireAuth } from "@/lib/auth-guard";
import { isUniqueConstraintError } from "@/lib/prisma-errors";
import type { ActionResult } from "@/lib/action-result";

export async function createCircuito(data: CircuitoInput): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = circuitoSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.circuito.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe um circuito com esse nome." };
    }
    console.error(error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/circuitos");
  return { success: true, mensagemSucesso: "Circuito criado com sucesso." };
}

export async function updateCircuito(
  id: string,
  data: CircuitoInput,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = circuitoSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.circuito.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe um circuito com esse nome." };
    }
    console.error(error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/circuitos");
  return { success: true, mensagemSucesso: "Circuito atualizado com sucesso." };
}

export async function deleteCircuito(id: string): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await prisma.circuito.delete({ where: { id } });
  } catch {
    return {
      error:
        "Não foi possível excluir: existem categorias vinculadas a este circuito.",
    };
  }

  revalidatePath("/circuitos");
  return { success: true, mensagemSucesso: "Circuito excluído com sucesso." };
}
