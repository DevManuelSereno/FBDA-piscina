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
  tipoCompeticaoId: string;
  tipoNome: string;
  circuitoNome: string;
};

type CompeticaoColumnsProps = {
  tipos: { id: string; nome: string; circuitoNome: string }[];
};

export function buildColumns({
  tipos,
}: CompeticaoColumnsProps): ColumnDef<CompeticaoRow>[] {
  return [
    { accessorKey: "nome", header: "Nome" },
    {
      id: "data",
      header: "Data",
      accessorFn: (row) => row.data.toLocaleDateString("pt-BR", { timeZone: "UTC" }),
    },
    { accessorKey: "circuitoNome", header: "Circuito" },
    { accessorKey: "tipoNome", header: "Tipo" },
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
          <CompeticaoFormDialog mode="edit" competicao={row.original} tipos={tipos} />
          <CompeticaoDeleteButton id={row.original.id} nome={row.original.nome} />
        </div>
      ),
    },
  ];
}
