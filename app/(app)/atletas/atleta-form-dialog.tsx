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
import { SEXO_ATLETA } from "@/lib/validations";
import { createAtleta, updateAtleta, type ActionResult } from "./actions";

type Atleta = {
  id: string;
  nomeCompleto: string;
  dataNascimento: Date;
  sexo: string;
  clubeId: string;
  ativo: boolean;
};

type AtletaFormDialogProps = (
  | { mode: "create" }
  | { mode: "edit"; atleta: Atleta }
) & {
  clubes: { id: string; nome: string }[];
};

const initialState: ActionResult = {};

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function AtletaFormDialog(props: AtletaFormDialogProps) {
  const [open, setOpen] = useState(false);
  const action =
    props.mode === "create"
      ? createAtleta
      : updateAtleta.bind(null, props.atleta.id);
  const [state, formAction, isPending] = useActionState(action, initialState);
  useCloseOnSuccess(state, setOpen);

  const atleta = props.mode === "edit" ? props.atleta : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          props.mode === "create" ? (
            <Button>
              <Plus className="size-4" />
              Novo atleta
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Editar ${props.atleta.nomeCompleto}`}
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
              {props.mode === "create" ? "Novo atleta" : "Editar atleta"}
            </DialogTitle>
          </DialogHeader>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nomeCompleto">Nome completo</Label>
              <Input
                id="nomeCompleto"
                name="nomeCompleto"
                defaultValue={atleta?.nomeCompleto}
                required
                minLength={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="dataNascimento">Data de nascimento</Label>
                <Input
                  id="dataNascimento"
                  name="dataNascimento"
                  type="date"
                  defaultValue={
                    atleta ? toDateInputValue(atleta.dataNascimento) : undefined
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="sexo">Sexo</Label>
                <NativeSelect id="sexo" name="sexo" defaultValue={atleta?.sexo ?? "F"}>
                  {SEXO_ATLETA.map((sexo) => (
                    <option key={sexo} value={sexo}>
                      {sexo}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="clubeId">Clube</Label>
              <NativeSelect
                id="clubeId"
                name="clubeId"
                defaultValue={atleta?.clubeId ?? ""}
                required
              >
                <option value="" disabled>
                  Selecione um clube
                </option>
                {props.clubes.map((clube) => (
                  <option key={clube.id} value={clube.id}>
                    {clube.nome}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="ativo"
                defaultChecked={atleta?.ativo ?? true}
                className="size-4 rounded border-input"
              />
              Ativo
            </label>

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
