import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Competições</h1>
        <p className="text-muted-foreground">
          Etapas e eventos onde os resultados são lançados.
        </p>
      </div>
      <TableSkeleton columns={6} />
    </div>
  );
}
