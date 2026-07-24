import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
        <p className="text-muted-foreground">
          Faixas etárias e sexo usados para classificar atletas, dentro de
          cada circuito.
        </p>
      </div>
      <TableSkeleton columns={5} />
    </div>
  );
}
