import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Atletas</h1>
        <p className="text-muted-foreground">
          Atletas cadastrados, com a categoria atual calculada pela idade.
        </p>
      </div>
      <TableSkeleton columns={7} />
    </div>
  );
}
