"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CompeticaoFormDialog } from "./competicao-form-dialog";
import { CompeticaoDeleteButton } from "./competicao-delete-button";

export type CompeticaoRow = {
  id: string;
  nome: string;
  data: Date;
  local: string | null;
  temporada: string | null;
};

export const columns: ColumnDef<CompeticaoRow>[] = [
  { accessorKey: "nome", header: "Nome" },
  {
    id: "data",
    header: "Data",
    accessorFn: (row) => row.data.toLocaleDateString("pt-BR", { timeZone: "UTC" }),
  },
  {
    accessorKey: "local",
    header: "Local",
    cell: ({ row }) => row.original.local || "—",
  },
  {
    accessorKey: "temporada",
    header: "Temporada",
    cell: ({ row }) => row.original.temporada || "—",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <CompeticaoFormDialog mode="edit" competicao={row.original} />
        <CompeticaoDeleteButton id={row.original.id} nome={row.original.nome} />
      </div>
    ),
  },
];
