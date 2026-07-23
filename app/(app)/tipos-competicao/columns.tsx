"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { TipoCompeticaoFormDialog } from "./tipo-competicao-form-dialog";
import { TipoCompeticaoDeleteButton } from "./tipo-competicao-delete-button";

export type TipoCompeticaoRow = {
  id: string;
  nome: string;
  circuitoId: string;
  circuitoNome: string;
  metodoPontuacao: string;
  grupoRelatorio: string;
  ordem: number;
  regraPontuacaoId: string | null;
  regraNome: string | null;
};

type TipoCompeticaoColumnsProps = {
  circuitos: { id: string; nome: string }[];
  regras: { id: string; nome: string }[];
};

export function buildColumns({
  circuitos,
  regras,
}: TipoCompeticaoColumnsProps): ColumnDef<TipoCompeticaoRow>[] {
  return [
    { accessorKey: "circuitoNome", header: "Circuito" },
    { accessorKey: "nome", header: "Nome" },
    {
      id: "metodoPontuacao",
      header: "Método",
      cell: ({ row }) =>
        row.original.metodoPontuacao === "COLOCACAO"
          ? "Por colocação"
          : "Manual",
    },
    { accessorKey: "grupoRelatorio", header: "Grupo no relatório" },
    {
      id: "regraNome",
      header: "Regra",
      cell: ({ row }) => row.original.regraNome ?? "—",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <TipoCompeticaoFormDialog
            mode="edit"
            tipo={row.original}
            circuitos={circuitos}
            regras={regras}
          />
          <TipoCompeticaoDeleteButton id={row.original.id} nome={row.original.nome} />
        </div>
      ),
    },
  ];
}
