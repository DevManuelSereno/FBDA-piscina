"use client";

import { DataTable } from "@/components/data-table";
import { buildColumns, type TipoCompeticaoRow } from "./columns";

export function TiposCompeticaoTable({
  rows,
  circuitos,
  regras,
}: {
  rows: TipoCompeticaoRow[];
  circuitos: { id: string; nome: string }[];
  regras: { id: string; nome: string }[];
}) {
  return (
    <DataTable
      columns={buildColumns({ circuitos, regras })}
      data={rows}
      searchPlaceholder="Buscar tipo de competição..."
    />
  );
}
