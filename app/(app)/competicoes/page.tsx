import { prisma } from "@/lib/db";
import { DataTable } from "@/components/data-table";
import { CompeticaoFormDialog } from "./competicao-form-dialog";
import { columns } from "./columns";

export default async function CompeticoesPage() {
  const competicoes = await prisma.competicao.findMany({
    orderBy: { data: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Competições</h1>
          <p className="text-muted-foreground">
            Etapas e eventos onde os resultados são lançados.
          </p>
        </div>
        <CompeticaoFormDialog mode="create" />
      </div>

      <DataTable
        columns={columns}
        data={competicoes}
        searchPlaceholder="Buscar competição..."
      />
    </div>
  );
}
