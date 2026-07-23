import { prisma } from "@/lib/db";
import { DataTable } from "@/components/data-table";
import { CircuitoFormDialog } from "./circuito-form-dialog";
import { columns } from "./columns";

export default async function CircuitosPage() {
  const circuitos = await prisma.circuito.findMany({
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Circuitos</h1>
          <p className="text-muted-foreground">
            Cada circuito é um ranking independente (ex.: Infantil a Sênior,
            Master) com suas próprias categorias e competições.
          </p>
        </div>
        <CircuitoFormDialog mode="create" />
      </div>

      <DataTable
        columns={columns}
        data={circuitos}
        searchPlaceholder="Buscar circuito..."
      />
    </div>
  );
}
