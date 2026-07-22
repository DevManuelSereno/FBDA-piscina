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
import { SEXO_CATEGORIA } from "@/lib/validations";
import { createCategoria, updateCategoria, type ActionResult } from "./actions";

type Categoria = {
  id: string;
  nome: string;
  sexo: string;
  idadeMin: number;
  idadeMax: number;
};

type CategoriaFormDialogProps =
  | { mode: "create" }
  | { mode: "edit"; categoria: Categoria };

const initialState: ActionResult = {};

export function CategoriaFormDialog(props: CategoriaFormDialogProps) {
  const [open, setOpen] = useState(false);
  const action =
    props.mode === "create"
      ? createCategoria
      : updateCategoria.bind(null, props.categoria.id);
  const [state, formAction, isPending] = useActionState(action, initialState);
  useCloseOnSuccess(state, setOpen);

  const categoria = props.mode === "edit" ? props.categoria : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          props.mode === "create" ? (
            <Button>
              <Plus className="size-4" />
              Nova categoria
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Editar ${props.categoria.nome} ${props.categoria.sexo}`}
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
              {props.mode === "create" ? "Nova categoria" : "Editar categoria"}
            </DialogTitle>
          </DialogHeader>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                defaultValue={categoria?.nome}
                required
                minLength={2}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sexo">Sexo</Label>
              <NativeSelect
                id="sexo"
                name="sexo"
                defaultValue={categoria?.sexo ?? "M"}
              >
                {SEXO_CATEGORIA.map((sexo) => (
                  <option key={sexo} value={sexo}>
                    {sexo}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="idadeMin">Idade mínima</Label>
                <Input
                  id="idadeMin"
                  name="idadeMin"
                  type="number"
                  min={0}
                  defaultValue={categoria?.idadeMin}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="idadeMax">Idade máxima</Label>
                <Input
                  id="idadeMax"
                  name="idadeMax"
                  type="number"
                  min={0}
                  defaultValue={categoria?.idadeMax}
                  required
                />
              </div>
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
