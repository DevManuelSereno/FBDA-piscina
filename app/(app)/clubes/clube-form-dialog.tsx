"use client";

import { useActionState, useState } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCloseOnSuccess } from "@/hooks/use-close-on-success";
import { createClube, updateClube, type ActionResult } from "./actions";

type ClubeFormDialogProps =
  | { mode: "create" }
  | {
      mode: "edit";
      clube: { id: string; nome: string; sigla: string | null; cidade: string | null };
    };

const initialState: ActionResult = {};

export function ClubeFormDialog(props: ClubeFormDialogProps) {
  const [open, setOpen] = useState(false);
  const action =
    props.mode === "create"
      ? createClube
      : updateClube.bind(null, props.clube.id);
  const [state, formAction, isPending] = useActionState(action, initialState);
  useCloseOnSuccess(state, setOpen);

  const clube = props.mode === "edit" ? props.clube : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          props.mode === "create" ? (
            <Button>
              <Plus className="size-4" />
              Novo clube
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Editar ${props.clube.nome}`}
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
              {props.mode === "create" ? "Novo clube" : "Editar clube"}
            </DialogTitle>
          </DialogHeader>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                defaultValue={clube?.nome}
                required
                minLength={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="sigla">Sigla</Label>
                <Input id="sigla" name="sigla" defaultValue={clube?.sigla ?? ""} maxLength={10} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" name="cidade" defaultValue={clube?.cidade ?? ""} />
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
