"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ProvaFormDialog } from "./prova-form-dialog";
import { ProvaDeleteButton } from "./prova-delete-button";

export type ProvaRow = {
  id: string;
  nome: string;
  estilo: string;
  distancia: number;
  piscina: string;
};

export const columns: ColumnDef<ProvaRow>[] = [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "estilo", header: "Estilo" },
  {
    id: "distancia",
    header: "Distância",
    accessorFn: (row) => `${row.distancia}m`,
  },
  { accessorKey: "piscina", header: "Piscina" },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <ProvaFormDialog mode="edit" prova={row.original} />
        <ProvaDeleteButton id={row.original.id} nome={row.original.nome} />
      </div>
    ),
  },
];
