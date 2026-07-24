"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ESTILO_PROVA, PISCINA, provaSchema, type ProvaInput } from "@/lib/validations";
import { createProva, updateProva } from "./actions";

type Prova = {
  id: string;
  nome: string;
  estilo: string;
  distancia: number;
  piscina: string;
};

type ProvaFormDialogProps = { mode: "create" } | { mode: "edit"; prova: Prova };

export function ProvaFormDialog(props: ProvaFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const prova = props.mode === "edit" ? props.prova : undefined;

  const defaultValues: ProvaInput = {
    nome: prova?.nome ?? "",
    estilo: (prova?.estilo as ProvaInput["estilo"]) ?? ESTILO_PROVA[0],
    distancia: prova?.distancia ?? 0,
    piscina: (prova?.piscina as ProvaInput["piscina"]) ?? PISCINA[0],
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProvaInput>({
    resolver: zodResolver(provaSchema),
    defaultValues,
  });

  function onOpenChange(novoOpen: boolean) {
    if (novoOpen) {
      reset(defaultValues);
      setServerError(null);
    }
    setOpen(novoOpen);
  }

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      const resultado =
        props.mode === "create"
          ? await createProva(data)
          : await updateProva(props.prova.id, data);
      if (resultado.error) {
        setServerError(resultado.error);
      } else {
        setOpen(false);
        toast.success(resultado.mensagemSucesso ?? "Salvo com sucesso.");
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="nome">Nome</FieldLabel>
              <Input id="nome" placeholder="Ex.: 100m Livre" {...register("nome")} />
              <FieldError errors={[errors.nome]} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="estilo">Estilo</FieldLabel>
                <NativeSelect id="estilo" {...register("estilo")}>
                  {ESTILO_PROVA.map((estilo) => (
                    <option key={estilo} value={estilo}>
                      {estilo}
                    </option>
                  ))}
                </NativeSelect>
                <FieldError errors={[errors.estilo]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="distancia">Distância (m)</FieldLabel>
                <Input
                  id="distancia"
                  type="number"
                  min={1}
                  {...register("distancia", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.distancia]} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="piscina">Piscina</FieldLabel>
              <NativeSelect id="piscina" {...register("piscina")}>
                {PISCINA.map((piscina) => (
                  <option key={piscina} value={piscina}>
                    {piscina}
                  </option>
                ))}
              </NativeSelect>
              <FieldError errors={[errors.piscina]} />
            </Field>

            {serverError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {serverError}
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
