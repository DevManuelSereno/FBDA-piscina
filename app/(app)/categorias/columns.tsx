"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CategoriaFormDialog } from "./categoria-form-dialog";
import { CategoriaDeleteButton } from "./categoria-delete-button";

export type CategoriaRow = {
  id: string;
  nome: string;
  sexo: string;
  idadeMin: number;
  idadeMax: number;
};

export const columns: ColumnDef<CategoriaRow>[] = [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "sexo", header: "Sexo" },
  {
    id: "faixa",
    header: "Faixa etária",
    accessorFn: (row) => `${row.idadeMin} a ${row.idadeMax} anos`,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <CategoriaFormDialog mode="edit" categoria={row.original} />
        <CategoriaDeleteButton
          id={row.original.id}
          nome={`${row.original.nome} (${row.original.sexo})`}
        />
      </div>
    ),
  },
];
