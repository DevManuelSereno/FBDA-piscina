import { prisma } from "@/lib/db";
import { buscarMatriz } from "@/lib/relatorio-matriz-query";
import { FiltrosMatriz, type FiltrosMatrizValores } from "./filtros";
import { MatrizTable } from "./matriz-table";
import { ExportarPdfButton } from "./exportar-pdf-button";

export default async function RelatorioMatrizPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const [circuitos, temporadasRaw] = await Promise.all([
    prisma.circuito.findMany({ where: { ativo: true }, orderBy: { ordem: "asc" } }),
    prisma.competicao.findMany({
      distinct: ["temporada"],
      select: { temporada: true },
    }),
  ]);
  const temporadas = temporadasRaw
    .map((t) => t.temporada)
    .filter((t): t is string => !!t);

  const valores: FiltrosMatrizValores = {
    circuitoId: params.circuitoId || circuitos[0]?.id || "",
    sexo: params.sexo === "F" ? "F" : "M",
    temporada: params.temporada ?? "",
  };

  const { colunas, grupos, linhas } = await buscarMatriz(valores);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Relatório Matriz
          </h1>
          <p className="text-muted-foreground">
            Pontuação de cada atleta em todas as competições do circuito,
            com subtotais por tipo — mesmo formato usado hoje em planilha.
          </p>
        </div>
        <ExportarPdfButton valores={valores} />
      </div>

      <FiltrosMatriz
        valores={valores}
        circuitos={circuitos}
        temporadas={temporadas}
      />

      <MatrizTable colunas={colunas} grupos={grupos} linhas={linhas} />
    </div>
  );
}
