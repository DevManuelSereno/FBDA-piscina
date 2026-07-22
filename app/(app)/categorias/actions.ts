"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { categoriaSchema } from "@/lib/validations";

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
  const parsed = parseCategoriaForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.categoria.create({ data: parsed.data });
  } catch {
    return { error: "Já existe uma categoria com esse nome e sexo." };
  }

  revalidatePath("/categorias");
  return { success: true };
}

export async function updateCategoria(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseCategoriaForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.categoria.update({ where: { id }, data: parsed.data });
  } catch {
    return { error: "Já existe uma categoria com esse nome e sexo." };
  }

  revalidatePath("/categorias");
  return { success: true };
}

export async function deleteCategoria(id: string): Promise<ActionResult> {
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
