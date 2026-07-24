"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { categoriaSchema, type CategoriaInput } from "@/lib/validations";
import { requireAuth } from "@/lib/auth-guard";
import { isUniqueConstraintError } from "@/lib/prisma-errors";
import type { ActionResult } from "@/lib/action-result";

export async function createCategoria(data: CategoriaInput): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = categoriaSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.categoria.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe uma categoria com esse nome, sexo e circuito." };
    }
    console.error(error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/categorias");
  return { success: true, mensagemSucesso: "Categoria criada com sucesso." };
}

export async function updateCategoria(
  id: string,
  data: CategoriaInput,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = categoriaSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.categoria.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe uma categoria com esse nome, sexo e circuito." };
    }
    console.error(error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/categorias");
  return { success: true, mensagemSucesso: "Categoria atualizada com sucesso." };
}

export async function deleteCategoria(id: string): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await prisma.categoria.delete({ where: { id } });
  } catch {
    return {
      error:
        "Não foi possível excluir: existem resultados vinculados a esta categoria.",
    };
  }

  revalidatePath("/categorias");
  return { success: true, mensagemSucesso: "Categoria excluída com sucesso." };
}
