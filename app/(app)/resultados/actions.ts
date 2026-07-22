"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { parseResultadoInput, type ResultadoStatus } from "@/lib/resultado";

export type SalvarResultadoInput = {
  atletaId: string;
  provaId: string;
  competicaoId: string;
  categoriaId: string;
  status: ResultadoStatus;
  tempoRaw: string;
  colocacaoRaw: string;
};

export type SalvarResultadoOutput = { error?: string; success?: boolean };

export async function salvarResultado(
  input: SalvarResultadoInput,
): Promise<SalvarResultadoOutput> {
  const parsed = parseResultadoInput({
    status: input.status,
    tempoRaw: input.tempoRaw,
    colocacaoRaw: input.colocacaoRaw,
  });

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  await prisma.resultado.upsert({
    where: {
      atletaId_provaId_competicaoId: {
        atletaId: input.atletaId,
        provaId: input.provaId,
        competicaoId: input.competicaoId,
      },
    },
    create: {
      atletaId: input.atletaId,
      provaId: input.provaId,
      competicaoId: input.competicaoId,
      categoriaId: input.categoriaId,
      status: parsed.status,
      tempoCentesimos: parsed.tempoCentesimos,
      colocacao: parsed.colocacao,
    },
    update: {
      status: parsed.status,
      tempoCentesimos: parsed.tempoCentesimos,
      colocacao: parsed.colocacao,
    },
  });

  revalidatePath("/resultados");
  return { success: true };
}
