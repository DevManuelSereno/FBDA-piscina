import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
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
      </div>
      <div className="grid grid-cols-1 gap-4 sm:max-w-lg sm:grid-cols-3">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
      <TableSkeleton columns={9} rows={8} />
    </div>
  );
}
