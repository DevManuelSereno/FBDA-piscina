"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AtletaFormDialog } from "./atleta-form-dialog";
import { AtletaDeleteButton } from "./atleta-delete-button";

export type AtletaRow = {
  id: string;
  nomeCompleto: string;
  dataNascimento: Date;
  sexo: string;
  clubeId: string;
  clubeNome: string;
  ativo: boolean;
  categoriaAtual: string | null;
};

type AtletaColumnsProps = {
  clubes: { id: string; nome: string }[];
};

export function buildColumns({
  clubes,
}: AtletaColumnsProps): ColumnDef<AtletaRow>[] {
  return [
    { accessorKey: "nomeCompleto", header: "Nome" },
    { accessorKey: "clubeNome", header: "Clube" },
    { accessorKey: "sexo", header: "Sexo" },
    {
      id: "idade",
      header: "Nascimento",
      accessorFn: (row) =>
        row.dataNascimento.toLocaleDateString("pt-BR", { timeZone: "UTC" }),
    },
    {
      id: "categoriaAtual",
      header: "Categoria atual",
      cell: ({ row }) => row.original.categoriaAtual ?? "—",
    },
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
          <AtletaFormDialog mode="edit" atleta={row.original} clubes={clubes} />
          <AtletaDeleteButton
            id={row.original.id}
            nome={row.original.nomeCompleto}
          />
        </div>
      ),
    },
  ];
}
