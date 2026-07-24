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
import { clubeSchema, type ClubeInput } from "@/lib/validations";
import { createClube, updateClube } from "./actions";

type ClubeFormDialogProps =
  | { mode: "create" }
  | {
      mode: "edit";
      clube: { id: string; nome: string; sigla: string | null; cidade: string | null };
    };

export function ClubeFormDialog(props: ClubeFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const clube = props.mode === "edit" ? props.clube : undefined;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClubeInput>({
    resolver: zodResolver(clubeSchema),
    defaultValues: {
      nome: clube?.nome ?? "",
      sigla: clube?.sigla ?? "",
      cidade: clube?.cidade ?? "",
    },
  });

  function onOpenChange(novoOpen: boolean) {
    if (novoOpen) {
      reset({
        nome: clube?.nome ?? "",
        sigla: clube?.sigla ?? "",
        cidade: clube?.cidade ?? "",
      });
      setServerError(null);
    }
    setOpen(novoOpen);
  }

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      const resultado =
        props.mode === "create"
          ? await createClube(data)
          : await updateClube(props.clube.id, data);
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
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="nome">Nome</FieldLabel>
              <Input id="nome" {...register("nome")} />
              <FieldError errors={[errors.nome]} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="sigla">Sigla</FieldLabel>
                <Input id="sigla" maxLength={10} {...register("sigla")} />
                <FieldError errors={[errors.sigla]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="cidade">Cidade</FieldLabel>
                <Input id="cidade" {...register("cidade")} />
                <FieldError errors={[errors.cidade]} />
              </Field>
            </div>

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
