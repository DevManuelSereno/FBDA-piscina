import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Tipos de Competição
        </h1>
        <p className="text-muted-foreground">
          Define o nível de cada competição dentro do circuito (Concurso,
          Regional, Brasileiro...) e como ela é pontuada.
        </p>
      </div>
      <TableSkeleton columns={5} />
    </div>
  );
}
