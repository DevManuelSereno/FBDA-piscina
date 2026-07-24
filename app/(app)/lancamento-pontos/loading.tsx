import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Lançamento de Pontos
        </h1>
        <p className="text-muted-foreground">
          Para competições com pontuação manual (Regional, Brasileiro,
          Fita Azul...): digite os pontos oficiais de cada atleta.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:max-w-md sm:grid-cols-2">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
      <TableSkeleton columns={4} />
    </div>
  );
}
