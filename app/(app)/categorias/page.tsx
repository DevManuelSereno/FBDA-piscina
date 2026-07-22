import { prisma } from "@/lib/db";
import { DataTable } from "@/components/data-table";
import { CategoriaFormDialog } from "./categoria-form-dialog";
import { columns } from "./columns";

export default async function CategoriasPage() {
  const categorias = await prisma.categoria.findMany({
    orderBy: [{ idadeMin: "asc" }, { sexo: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Faixas etárias e sexo usados para classificar atletas.
          </p>
        </div>
        <CategoriaFormDialog mode="create" />
      </div>

      <DataTable
        columns={columns}
        data={categorias}
        searchPlaceholder="Buscar categoria..."
      />
    </div>
  );
}
