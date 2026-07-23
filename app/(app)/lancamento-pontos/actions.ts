"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { inferirCategoria } from "@/lib/categoria";
import { parsePontosManual } from "@/lib/pontuacao-competicao";

export type SalvarPontuacaoManualInput = {
  atletaId: string;
  competicaoId: string;
  circuitoId: string;
  pontosRaw: string;
};

export type SalvarPontuacaoManualOutput = { error?: string; success?: boolean };

export async function salvarPontuacaoManual(
  input: SalvarPontuacaoManualInput,
): Promise<SalvarPontuacaoManualOutput> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = parsePontosManual(input.pontosRaw);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const [atleta, competicao, categorias] = await Promise.all([
    prisma.atleta.findUnique({ where: { id: input.atletaId } }),
    prisma.competicao.findUnique({
      where: { id: input.competicaoId },
      include: { tipoCompeticao: true },
    }),
    prisma.categoria.findMany(),
  ]);

  if (!atleta || !competicao) {
    return { error: "Atleta ou competição não encontrados." };
  }

  if (competicao.tipoCompeticao.metodoPontuacao !== "MANUAL") {
    return {
      error: "Esta competição usa lançamento por colocação, não manual.",
    };
  }

  const categoria = inferirCategoria(
    atleta.dataNascimento,
    atleta.sexo,
    competicao.data,
    categorias,
    input.circuitoId,
  );

  if (!categoria) {
    return { error: "Atleta sem categoria correspondente." };
  }

  try {
    await prisma.pontuacaoCompeticao.upsert({
      where: {
        atletaId_competicaoId: {
          atletaId: input.atletaId,
          competicaoId: input.competicaoId,
        },
      },
      create: {
        atletaId: input.atletaId,
        competicaoId: input.competicaoId,
        categoriaId: categoria.id,
        pontos: parsed.pontos,
        origem: "MANUAL",
      },
      update: {
        categoriaId: categoria.id,
        pontos: parsed.pontos,
        origem: "MANUAL",
      },
    });
  } catch (error) {
    console.error(error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/lancamento-pontos");
  revalidatePath("/ranking");
  return { success: true };
}
