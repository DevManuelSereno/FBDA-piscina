import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Circuitos</h1>
        <p className="text-muted-foreground">
          Cada circuito é um ranking independente (ex.: Infantil a Sênior,
          Master) com suas próprias categorias e competições.
        </p>
      </div>
      <TableSkeleton columns={3} />
    </div>
  );
}
