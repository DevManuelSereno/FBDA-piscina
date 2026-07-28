"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { circuitoSchema, type CircuitoInput } from "@/lib/validations";
import { createCircuito, updateCircuito } from "./actions";

type Circuito = {
  id: string;
  nome: string;
  ordem: number;
  ativo: boolean;
};

type CircuitoFormDialogProps =
  | { mode: "create" }
  | { mode: "edit"; circuito: Circuito };

export function CircuitoFormDialog(props: CircuitoFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const circuito = props.mode === "edit" ? props.circuito : undefined;

  const defaultValues: CircuitoInput = {
    nome: circuito?.nome ?? "",
    ordem: circuito?.ordem ?? 0,
    ativo: circuito?.ativo ?? true,
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CircuitoInput>({
    resolver: zodResolver(circuitoSchema),
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
          ? await createCircuito(data)
          : await updateCircuito(props.circuito.id, data);
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
      <DialogTrigger asChild>
        {props.mode === "create" ? (
          <Button>
            <Plus className="size-4" />
            Novo circuito
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Editar ${props.circuito.nome}`}
          >
            <Pencil className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      {open && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {props.mode === "create" ? "Novo circuito" : "Editar circuito"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="nome">Nome</FieldLabel>
              <Input
                id="nome"
                placeholder="Ex.: Infantil a Sênior, Master"
                {...register("nome")}
              />
              <FieldError errors={[errors.nome]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="ordem">Ordem de exibição</FieldLabel>
              <Input
                id="ordem"
                type="number"
                min={0}
                {...register("ordem", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.ordem]} />
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 cursor-pointer rounded border-input"
                {...register("ativo")}
              />
              Ativo
            </label>

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
