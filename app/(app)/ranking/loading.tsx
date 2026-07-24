import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
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
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ranking Individual</h2>
        <TableSkeleton columns={4} />
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ranking Coletivo (por Clube)</h2>
        <TableSkeleton columns={3} />
      </div>
    </div>
  );
}
