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
  ordem: number;
  autoClassificavel: boolean;
  circuitoId: string;
  circuitoNome: string;
};

type CategoriaColumnsProps = {
  circuitos: { id: string; nome: string }[];
};

export function buildColumns({
  circuitos,
}: CategoriaColumnsProps): ColumnDef<CategoriaRow>[] {
  return [
    { accessorKey: "circuitoNome", header: "Circuito" },
    { accessorKey: "nome", header: "Nome" },
    { accessorKey: "sexo", header: "Sexo" },
    {
      id: "faixa",
      header: "Faixa etária",
      accessorFn: (row) => `${row.idadeMin} a ${row.idadeMax} anos`,
    },
    {
      id: "autoClassificavel",
      header: "Auto por idade",
      cell: ({ row }) => (row.original.autoClassificavel ? "Sim" : "Não"),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <CategoriaFormDialog
            mode="edit"
            categoria={row.original}
            circuitos={circuitos}
          />
          <CategoriaDeleteButton
            id={row.original.id}
            nome={`${row.original.nome} (${row.original.sexo})`}
          />
        </div>
      ),
    },
  ];
}
