"use client";

import { DataTable } from "@/components/data-table";
import { buildColumns, type CompeticaoRow } from "./columns";

export function CompeticoesTable({
  rows,
  tipos,
}: {
  rows: CompeticaoRow[];
  tipos: { id: string; nome: string; circuitoNome: string }[];
}) {
  return (
    <DataTable
      columns={buildColumns({ tipos })}
      data={rows}
      searchPlaceholder="Buscar competição..."
    />
  );
}
