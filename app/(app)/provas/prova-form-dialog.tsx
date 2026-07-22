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
import { ESTILO_PROVA, PISCINA } from "@/lib/validations";
import { createProva, updateProva, type ActionResult } from "./actions";

type Prova = {
  id: string;
  nome: string;
  estilo: string;
  distancia: number;
  piscina: string;
};

type ProvaFormDialogProps = { mode: "create" } | { mode: "edit"; prova: Prova };

const initialState: ActionResult = {};

export function ProvaFormDialog(props: ProvaFormDialogProps) {
  const [open, setOpen] = useState(false);
  const action =
    props.mode === "create" ? createProva : updateProva.bind(null, props.prova.id);
  const [state, formAction, isPending] = useActionState(action, initialState);
  useCloseOnSuccess(state, setOpen);

  const prova = props.mode === "edit" ? props.prova : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          props.mode === "create" ? (
            <Button>
              <Plus className="size-4" />
              Nova prova
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Editar ${props.prova.nome}`}
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
              {props.mode === "create" ? "Nova prova" : "Editar prova"}
            </DialogTitle>
          </DialogHeader>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                defaultValue={prova?.nome}
                required
                minLength={2}
                placeholder="Ex.: 100m Livre"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="estilo">Estilo</Label>
                <NativeSelect
                  id="estilo"
                  name="estilo"
                  defaultValue={prova?.estilo ?? ESTILO_PROVA[0]}
                >
                  {ESTILO_PROVA.map((estilo) => (
                    <option key={estilo} value={estilo}>
                      {estilo}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="distancia">Distância (m)</Label>
                <Input
                  id="distancia"
                  name="distancia"
                  type="number"
                  min={1}
                  defaultValue={prova?.distancia}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="piscina">Piscina</Label>
              <NativeSelect
                id="piscina"
                name="piscina"
                defaultValue={prova?.piscina ?? PISCINA[0]}
              >
                {PISCINA.map((piscina) => (
                  <option key={piscina} value={piscina}>
                    {piscina}
                  </option>
                ))}
              </NativeSelect>
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
