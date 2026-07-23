import { prisma } from "@/lib/db";
import { CompeticaoFormDialog } from "./competicao-form-dialog";
import { CompeticoesTable } from "./competicoes-table";
import type { CompeticaoRow } from "./columns";

export default async function CompeticoesPage() {
  const [competicoes, tiposRaw] = await Promise.all([
    prisma.competicao.findMany({
      include: { tipoCompeticao: { include: { circuito: true } } },
      orderBy: { data: "desc" },
    }),
    prisma.tipoCompeticao.findMany({
      include: { circuito: true },
      orderBy: [{ circuito: { ordem: "asc" } }, { ordem: "asc" }],
    }),
  ]);

  const tipos = tiposRaw.map((t) => ({
    id: t.id,
    nome: t.nome,
    circuitoNome: t.circuito.nome,
  }));

  const rows: CompeticaoRow[] = competicoes.map((c) => ({
    id: c.id,
    nome: c.nome,
    data: c.data,
    local: c.local,
    temporada: c.temporada,
    tipoCompeticaoId: c.tipoCompeticaoId,
    tipoNome: c.tipoCompeticao.nome,
    circuitoNome: c.tipoCompeticao.circuito.nome,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Competições</h1>
          <p className="text-muted-foreground">
            Etapas e eventos onde os resultados são lançados.
          </p>
        </div>
        <CompeticaoFormDialog mode="create" tipos={tipos} />
      </div>

      <CompeticoesTable rows={rows} tipos={tipos} />
    </div>
  );
}
