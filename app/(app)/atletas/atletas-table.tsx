"use client";

import { DataTable } from "@/components/data-table";
import { buildColumns, type AtletaRow } from "./columns";

// As colunas (com renderizadores de célula/JSX) só podem ser montadas do
// lado do cliente — passá-las prontas de um Server Component quebra a
// serialização de props do React Server Components. Este wrapper recebe
// apenas dados serializáveis do servidor e monta as colunas aqui.
export function AtletasTable({
  rows,
  clubes,
}: {
  rows: AtletaRow[];
  clubes: { id: string; nome: string }[];
}) {
  return (
    <DataTable
      columns={buildColumns({ clubes })}
      data={rows}
      searchPlaceholder="Buscar atleta..."
    />
  );
}
