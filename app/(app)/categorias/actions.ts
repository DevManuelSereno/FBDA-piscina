"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { categoriaSchema } from "@/lib/validations";
import { requireAuth } from "@/lib/auth-guard";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

export type ActionResult = { error?: string; success?: boolean };

function parseCategoriaForm(formData: FormData) {
  return categoriaSchema.safeParse({
    nome: formData.get("nome"),
    sexo: formData.get("sexo"),
    idadeMin: formData.get("idadeMin"),
    idadeMax: formData.get("idadeMax"),
  });
}

export async function createCategoria(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = parseCategoriaForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.categoria.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe uma categoria com esse nome e sexo." };
    }
    console.error(error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/categorias");
  return { success: true };
}

export async function updateCategoria(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = parseCategoriaForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.categoria.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe uma categoria com esse nome e sexo." };
    }
    console.error(error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/categorias");
  return { success: true };
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
  return { success: true };
}
