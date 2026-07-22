import { prisma } from "@/lib/db";
import { DataTable } from "@/components/data-table";
import { ProvaFormDialog } from "./prova-form-dialog";
import { columns } from "./columns";

export default async function ProvasPage() {
  const provas = await prisma.prova.findMany({
    orderBy: [{ distancia: "asc" }, { nome: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Provas</h1>
          <p className="text-muted-foreground">
            Provas disputadas nas competições.
          </p>
        </div>
        <ProvaFormDialog mode="create" />
      </div>

      <DataTable columns={columns} data={provas} searchPlaceholder="Buscar prova..." />
    </div>
  );
}
