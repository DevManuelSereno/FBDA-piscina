import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Melhores do Ano</h1>
          <p className="text-muted-foreground">
            Ranking de temporada inteira (Regulamento Geral, Art. 28º/29º).
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:max-w-xl sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Individual</h2>
        <TableSkeleton columns={4} />
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Coletivo (por Clube)</h2>
        <TableSkeleton columns={3} />
      </div>
    </div>
  );
}
