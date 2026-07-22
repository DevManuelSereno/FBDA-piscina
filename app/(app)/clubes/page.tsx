import { prisma } from "@/lib/db";
import { DataTable } from "@/components/data-table";
import { ClubeFormDialog } from "./clube-form-dialog";
import { columns } from "./columns";

export default async function ClubesPage() {
  const clubes = await prisma.clube.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { atletas: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clubes</h1>
          <p className="text-muted-foreground">
            Clubes participantes das competições.
          </p>
        </div>
        <ClubeFormDialog mode="create" />
      </div>

      <DataTable columns={columns} data={clubes} searchPlaceholder="Buscar clube..." />
    </div>
  );
}
