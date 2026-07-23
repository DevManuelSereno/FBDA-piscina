"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { inferirCategoria } from "@/lib/categoria";
import {
  parseResultadoInput,
  temColocacaoDuplicada,
  type ResultadoStatus,
} from "@/lib/resultado";
import { calcularPontos } from "@/lib/scoring";

export type SalvarResultadoInput = {
  atletaId: string;
  provaId: string;
  competicaoId: string;
  circuitoId: string;
  status: ResultadoStatus;
  tempoRaw: string;
  colocacaoRaw: string;
};

export type SalvarResultadoOutput = {
  error?: string;
  warning?: string;
  success?: boolean;
};

export async function salvarResultado(
  input: SalvarResultadoInput,
): Promise<SalvarResultadoOutput> {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = parseResultadoInput({
    status: input.status,
    tempoRaw: input.tempoRaw,
    colocacaoRaw: input.colocacaoRaw,
  });

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const [atleta, competicao, categorias] = await Promise.all([
    prisma.atleta.findUnique({ where: { id: input.atletaId } }),
    prisma.competicao.findUnique({
      where: { id: input.competicaoId },
      include: { tipoCompeticao: { include: { regraPontuacao: { include: { posicoes: true } } } } },
    }),
    prisma.categoria.findMany(),
  ]);

  if (!atleta || !competicao) {
    return { error: "Atleta ou competição não encontrados." };
  }

  if (competicao.tipoCompeticao.metodoPontuacao !== "COLOCACAO") {
    return {
      error:
        "Esta competição usa lançamento manual de pontuação, não por colocação.",
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

  let pontos = 0;
  if (parsed.status === "VALIDO" && parsed.colocacao !== null) {
    const regra = competicao.tipoCompeticao.regraPontuacao;
    if (regra) {
      pontos = calcularPontos(parsed.colocacao, regra.posicoes);
    }
  }

  let warning: string | undefined;
  if (parsed.status === "VALIDO" && parsed.colocacao !== null) {
    const outrosResultados = await prisma.resultado.findMany({
      where: { provaId: input.provaId, competicaoId: input.competicaoId },
      select: { atletaId: true, colocacao: true },
    });
    if (
      temColocacaoDuplicada(outrosResultados, input.atletaId, parsed.colocacao)
    ) {
      warning = `Já existe outro atleta na colocação ${parsed.colocacao} nesta prova.`;
    }
  }

  try {
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
        categoriaId: categoria.id,
        status: parsed.status,
        tempoCentesimos: parsed.tempoCentesimos,
        colocacao: parsed.colocacao,
        pontos,
      },
      update: {
        status: parsed.status,
        tempoCentesimos: parsed.tempoCentesimos,
        colocacao: parsed.colocacao,
        pontos,
      },
    });
  } catch (error) {
    console.error(error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/resultados");
  return { success: true, warning };
}
