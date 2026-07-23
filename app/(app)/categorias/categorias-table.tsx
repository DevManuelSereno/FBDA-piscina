"use client";

import { DataTable } from "@/components/data-table";
import { buildColumns, type CategoriaRow } from "./columns";

// Mesma razão do padrão em atletas-table.tsx: colunas com JSX não podem
// vir prontas de um Server Component, então montamos aqui a partir de
// dados serializáveis.
export function CategoriasTable({
  rows,
  circuitos,
}: {
  rows: CategoriaRow[];
  circuitos: { id: string; nome: string }[];
}) {
  return (
    <DataTable
      columns={buildColumns({ circuitos })}
      data={rows}
      searchPlaceholder="Buscar categoria..."
    />
  );
}
