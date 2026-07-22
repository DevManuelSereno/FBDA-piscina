"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ClubeFormDialog } from "./clube-form-dialog";
import { ClubeDeleteButton } from "./clube-delete-button";

export type ClubeRow = {
  id: string;
  nome: string;
  sigla: string | null;
  cidade: string | null;
  _count: { atletas: number };
};

export const columns: ColumnDef<ClubeRow>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "sigla",
    header: "Sigla",
    cell: ({ row }) => row.original.sigla || "—",
  },
  {
    accessorKey: "cidade",
    header: "Cidade",
    cell: ({ row }) => row.original.cidade || "—",
  },
  {
    id: "atletas",
    header: "Atletas",
    accessorFn: (row) => row._count.atletas,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <ClubeFormDialog mode="edit" clube={row.original} />
        <ClubeDeleteButton id={row.original.id} nome={row.original.nome} />
      </div>
    ),
  },
];
