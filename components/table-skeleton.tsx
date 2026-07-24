import { Skeleton } from "@/components/ui/skeleton";

// Placeholder genérico de carregamento para as telas de listagem — usado
// nos loading.tsx de cada rota (Next.js mostra automaticamente durante a
// busca de dados do Server Component da página, sem estado manual de
// isLoading no cliente).
export function TableSkeleton({
  columns = 5,
  rows = 6,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-8 w-full max-w-sm" />
      <div className="rounded-md border">
        <div className="flex gap-4 border-b p-2">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 border-b p-2 last:border-0">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
