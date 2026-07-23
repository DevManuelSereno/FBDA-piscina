"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CircuitoFormDialog } from "./circuito-form-dialog";
import { CircuitoDeleteButton } from "./circuito-delete-button";

export type CircuitoRow = {
  id: string;
  nome: string;
  ordem: number;
  ativo: boolean;
};

export const columns: ColumnDef<CircuitoRow>[] = [
  { accessorKey: "ordem", header: "Ordem" },
  { accessorKey: "nome", header: "Nome" },
  {
    id: "ativo",
    header: "Status",
    cell: ({ row }) => (row.original.ativo ? "Ativo" : "Inativo"),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <CircuitoFormDialog mode="edit" circuito={row.original} />
        <CircuitoDeleteButton id={row.original.id} nome={row.original.nome} />
      </div>
    ),
  },
];
