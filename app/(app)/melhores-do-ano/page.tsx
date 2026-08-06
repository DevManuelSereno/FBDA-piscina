import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { buscarMelhoresDoAno } from "@/lib/melhores-do-ano-query";
import { FiltrosMelhoresDoAno, type FiltrosMelhoresDoAnoValores } from "./filtros";
import { MelhoresDoAnoIndividualTable } from "./individual-table";
import { MelhoresDoAnoColetivoTable } from "./coletivo-table";
import { ExportarPdfButtons } from "./exportar-pdf-buttons";

export const metadata: Metadata = {
  title: "Melhores do Ano",
};

export default async function MelhoresDoAnoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const valores: FiltrosMelhoresDoAnoValores = {
    circuitoId: params.circuitoId ?? "",
    temporada: params.temporada ?? "",
  };

  const [circuitos, temporadasRaw] = await Promise.all([
    prisma.circuito.findMany({ orderBy: { ordem: "asc" } }),
    prisma.competicao.findMany({
      distinct: ["temporada"],
      select: { temporada: true },
    }),
  ]);
  const temporadas = temporadasRaw
    .map((t) => t.temporada)
    .filter((t): t is string => !!t);

  const { individual, coletivo } = await buscarMelhoresDoAno(valores);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Melhores do Ano</h1>
          <p className="text-muted-foreground">
            Ranking de temporada inteira (Regulamento Geral, Art. 28º/29º):
            soma dos pontos da colocação do atleta em cada competição, numa
            escala própria por nível (Concursos, Campeonatos, Regionais,
            Nacionais), mais bônus de recorde.
          </p>
        </div>
        <ExportarPdfButtons valores={valores} />
      </div>

      <FiltrosMelhoresDoAno
        valores={valores}
        circuitos={circuitos}
        temporadas={temporadas}
      />

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Individual</h2>
        <MelhoresDoAnoIndividualTable itens={individual} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Coletivo (por Clube)</h2>
        <MelhoresDoAnoColetivoTable itens={coletivo} />
      </div>
    </div>
  );
}
