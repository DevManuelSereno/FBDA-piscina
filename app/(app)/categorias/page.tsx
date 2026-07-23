import { prisma } from "@/lib/db";
import { CategoriaFormDialog } from "./categoria-form-dialog";
import { CategoriasTable } from "./categorias-table";
import type { CategoriaRow } from "./columns";

export default async function CategoriasPage() {
  const [categorias, circuitos] = await Promise.all([
    prisma.categoria.findMany({
      include: { circuito: true },
      orderBy: [{ circuito: { ordem: "asc" } }, { ordem: "asc" }, { sexo: "asc" }],
    }),
    prisma.circuito.findMany({ orderBy: { ordem: "asc" } }),
  ]);

  const rows: CategoriaRow[] = categorias.map((c) => ({
    id: c.id,
    nome: c.nome,
    sexo: c.sexo,
    idadeMin: c.idadeMin,
    idadeMax: c.idadeMax,
    ordem: c.ordem,
    autoClassificavel: c.autoClassificavel,
    circuitoId: c.circuitoId,
    circuitoNome: c.circuito.nome,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Faixas etárias e sexo usados para classificar atletas, dentro de
            cada circuito.
          </p>
        </div>
        <CategoriaFormDialog mode="create" circuitos={circuitos} />
      </div>

      <CategoriasTable rows={rows} circuitos={circuitos} />
    </div>
  );
}
