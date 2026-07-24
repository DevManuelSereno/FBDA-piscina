"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { competicaoSchema, type CompeticaoInput } from "@/lib/validations";
import { createCompeticao, updateCompeticao } from "./actions";

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

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function CompeticaoFormDialog(props: CompeticaoFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const competicao = props.mode === "edit" ? props.competicao : undefined;

  const defaultValues: CompeticaoInput = {
    tipoCompeticaoId: competicao?.tipoCompeticaoId ?? "",
    nome: competicao?.nome ?? "",
    data: competicao?.data ?? new Date(),
    temporada: competicao?.temporada ?? "",
    local: competicao?.local ?? "",
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompeticaoInput>({
    resolver: zodResolver(competicaoSchema),
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
          ? await createCompeticao(data)
          : await updateCompeticao(props.competicao.id, data);
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
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="tipoCompeticaoId">Tipo de competição</FieldLabel>
              <NativeSelect id="tipoCompeticaoId" {...register("tipoCompeticaoId")}>
                <option value="" disabled>
                  Selecione um tipo
                </option>
                {props.tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.circuitoNome} — {tipo.nome}
                  </option>
                ))}
              </NativeSelect>
              <FieldError errors={[errors.tipoCompeticaoId]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="nome">Nome</FieldLabel>
              <Input id="nome" {...register("nome")} />
              <FieldError errors={[errors.nome]} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="data">Data</FieldLabel>
                <Controller
                  control={control}
                  name="data"
                  render={({ field }) => (
                    <Input
                      id="data"
                      type="date"
                      value={toDateInputValue(field.value)}
                      onChange={(e) =>
                        field.onChange(e.target.value ? new Date(e.target.value) : null)
                      }
                    />
                  )}
                />
                <FieldError errors={[errors.data]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="temporada">Temporada</FieldLabel>
                <Input id="temporada" placeholder="Ex.: 2026" {...register("temporada")} />
                <FieldError errors={[errors.temporada]} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="local">Local</FieldLabel>
              <Input id="local" {...register("local")} />
              <FieldError errors={[errors.local]} />
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
