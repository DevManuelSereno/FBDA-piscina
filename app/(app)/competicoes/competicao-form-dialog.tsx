"use client";

import { useActionState, useState } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCloseOnSuccess } from "@/hooks/use-close-on-success";
import {
  createCompeticao,
  updateCompeticao,
  type ActionResult,
} from "./actions";

type Competicao = {
  id: string;
  nome: string;
  data: Date;
  local: string | null;
  temporada: string | null;
  tipoCompeticaoId: string;
};

type CompeticaoFormDialogProps = (
  | { mode: "create" }
  | { mode: "edit"; competicao: Competicao }
) & {
  tipos: { id: string; nome: string; circuitoNome: string }[];
};

const initialState: ActionResult = {};

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function CompeticaoFormDialog(props: CompeticaoFormDialogProps) {
  const [open, setOpen] = useState(false);
  const action =
    props.mode === "create"
      ? createCompeticao
      : updateCompeticao.bind(null, props.competicao.id);
  const [state, formAction, isPending] = useActionState(action, initialState);
  useCloseOnSuccess(state, setOpen);

  const competicao = props.mode === "edit" ? props.competicao : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          props.mode === "create" ? (
            <Button>
              <Plus className="size-4" />
              Nova competição
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Editar ${props.competicao.nome}`}
            >
              <Pencil className="size-4" />
            </Button>
          )
        }
      />
      {open && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {props.mode === "create" ? "Nova competição" : "Editar competição"}
            </DialogTitle>
          </DialogHeader>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tipoCompeticaoId">Tipo de competição</Label>
              <NativeSelect
                id="tipoCompeticaoId"
                name="tipoCompeticaoId"
                defaultValue={competicao?.tipoCompeticaoId ?? ""}
                required
              >
                <option value="" disabled>
                  Selecione um tipo
                </option>
                {props.tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.circuitoNome} — {tipo.nome}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                defaultValue={competicao?.nome}
                required
                minLength={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  name="data"
                  type="date"
                  defaultValue={
                    competicao ? toDateInputValue(competicao.data) : undefined
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="temporada">Temporada</Label>
                <Input
                  id="temporada"
                  name="temporada"
                  defaultValue={competicao?.temporada ?? ""}
                  placeholder="Ex.: 2026"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="local">Local</Label>
              <Input id="local" name="local" defaultValue={competicao?.local ?? ""} />
            </div>

            {state.error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {state.error}
              </p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
