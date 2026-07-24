import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Provas</h1>
        <p className="text-muted-foreground">
          Provas disputadas nas competições.
        </p>
      </div>
      <TableSkeleton columns={4} />
    </div>
  );
}
