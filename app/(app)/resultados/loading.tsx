import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Lançamento de Resultados
        </h1>
        <p className="text-muted-foreground">
          Selecione o circuito, a competição e a prova para digitar os tempos.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:max-w-2xl sm:grid-cols-3">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
      <TableSkeleton columns={6} />
    </div>
  );
}
