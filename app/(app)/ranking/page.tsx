import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { buscarRanking } from "@/lib/ranking-query";
import { FiltrosRanking, type FiltrosRankingValores } from "./filtros";
import { RankingIndividualTable } from "./ranking-individual-table";
import { RankingColetivoTable } from "./ranking-coletivo-table";
import { EficienciaClubeTable } from "./eficiencia-clube-table";
import { ExportarPdfButtons } from "./exportar-pdf-buttons";

export const metadata: Metadata = {
  title: "Ranking",
};

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const valores: FiltrosRankingValores = {
    tipo: params.tipo === "provisorio" ? "provisorio" : "completo",
    circuitoId: params.circuitoId ?? "",
    competicaoId: params.competicaoId ?? "",
    categoriaId: params.categoriaId ?? "",
    clubeId: params.clubeId ?? "",
    sexo: params.sexo ?? "",
    temporada: params.temporada ?? "",
  };

  const [circuitos, competicoes, categoriasTodas, clubes, temporadasRaw] =
    await Promise.all([
      prisma.circuito.findMany({ orderBy: { ordem: "asc" } }),
      prisma.competicao.findMany({ orderBy: { data: "desc" } }),
      prisma.categoria.findMany({
        orderBy: [{ circuito: { ordem: "asc" } }, { ordem: "asc" }, { sexo: "asc" }],
      }),
      prisma.clube.findMany({ orderBy: { nome: "asc" } }),
      prisma.competicao.findMany({
        distinct: ["temporada"],
        select: { temporada: true },
      }),
    ]);
  const temporadas = temporadasRaw
    .map((t) => t.temporada)
    .filter((t): t is string => !!t);

  // O filtro de Categoria só mostra as categorias do circuito selecionado
  // (ou todas, se nenhum circuito foi escolhido ainda).
  const categorias = valores.circuitoId
    ? categoriasTodas.filter((c) => c.circuitoId === valores.circuitoId)
    : categoriasTodas;

  const {
    individual: rankingIndividual,
    coletivo: rankingColetivo,
    eficienciaClube,
  } = await buscarRanking(valores);

  // "Eficiência por clube" (soma ÷ atletas) só existe no Regulamento Master
  // (Art. 9º) — exibida apenas quando o circuito selecionado for o Master.
  const circuitoSelecionado = circuitos.find((c) => c.id === valores.circuitoId);
  const mostrarEficienciaClube = circuitoSelecionado?.nome === "Master";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ranking</h1>
          <p className="text-muted-foreground">
            Classificação individual e coletiva com base nos resultados
            lançados.
          </p>
        </div>
        <ExportarPdfButtons valores={valores} />
      </div>

      <FiltrosRanking
        valores={valores}
        circuitos={circuitos}
        competicoes={competicoes}
        categorias={categorias}
        clubes={clubes}
        temporadas={temporadas}
      />

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ranking Individual</h2>
        <RankingIndividualTable itens={rankingIndividual} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ranking Coletivo (por Clube)</h2>
        <RankingColetivoTable itens={rankingColetivo} />
      </div>

      {mostrarEficienciaClube && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Eficiência por Clube (Master)</h2>
          <p className="text-sm text-muted-foreground">
            Soma de pontos do clube dividida pela quantidade de atletas que
            pontuaram (Regulamento Master, Art. 9º) — diferente do ranking
            coletivo acima, que é uma soma simples.
          </p>
          <EficienciaClubeTable itens={eficienciaClube} />
        </div>
      )}
    </div>
  );
}
