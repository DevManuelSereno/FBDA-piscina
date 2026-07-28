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
import { SEXO_CATEGORIA, categoriaSchema, type CategoriaInput } from "@/lib/validations";
import { createCategoria, updateCategoria } from "./actions";

type Categoria = {
  id: string;
  nome: string;
  sexo: string;
  idadeMin: number;
  idadeMax: number;
  ordem: number;
  autoClassificavel: boolean;
  circuitoId: string;
};

type CategoriaFormDialogProps = (
  | { mode: "create" }
  | { mode: "edit"; categoria: Categoria }
) & {
  circuitos: { id: string; nome: string }[];
};

export function CategoriaFormDialog(props: CategoriaFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const categoria = props.mode === "edit" ? props.categoria : undefined;

  const defaultValues: CategoriaInput = {
    circuitoId: categoria?.circuitoId ?? "",
    nome: categoria?.nome ?? "",
    sexo: (categoria?.sexo as CategoriaInput["sexo"]) ?? "M",
    ordem: categoria?.ordem ?? 0,
    idadeMin: categoria?.idadeMin ?? 0,
    idadeMax: categoria?.idadeMax ?? 0,
    autoClassificavel: categoria?.autoClassificavel ?? true,
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoriaInput>({
    resolver: zodResolver(categoriaSchema),
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
          ? await createCategoria(data)
          : await updateCategoria(props.categoria.id, data);
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
        )}
      </DialogTrigger>
      {open && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {props.mode === "create" ? "Nova categoria" : "Editar categoria"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="circuitoId">Circuito</FieldLabel>
              <NativeSelect id="circuitoId" {...register("circuitoId")}>
                <option value="" disabled>
                  Selecione um circuito
                </option>
                {props.circuitos.map((circuito) => (
                  <option key={circuito.id} value={circuito.id}>
                    {circuito.nome}
                  </option>
                ))}
              </NativeSelect>
              <FieldError errors={[errors.circuitoId]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="nome">Nome</FieldLabel>
              <Input id="nome" {...register("nome")} />
              <FieldError errors={[errors.nome]} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="sexo">Sexo</FieldLabel>
                <NativeSelect id="sexo" {...register("sexo")}>
                  {SEXO_CATEGORIA.map((sexo) => (
                    <option key={sexo} value={sexo}>
                      {sexo}
                    </option>
                  ))}
                </NativeSelect>
                <FieldError errors={[errors.sexo]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="ordem">Ordem</FieldLabel>
                <Input
                  id="ordem"
                  type="number"
                  min={0}
                  {...register("ordem", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.ordem]} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="idadeMin">Idade mínima</FieldLabel>
                <Input
                  id="idadeMin"
                  type="number"
                  min={0}
                  {...register("idadeMin", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.idadeMin]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="idadeMax">Idade máxima</FieldLabel>
                <Input
                  id="idadeMax"
                  type="number"
                  min={0}
                  {...register("idadeMax", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.idadeMax]} />
              </Field>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 cursor-pointer rounded border-input"
                {...register("autoClassificavel")}
              />
              Classificar atletas automaticamente por idade
            </label>
            <p className="text-xs text-muted-foreground">
              Desmarque para categorias especiais (ex.: PCD, Pré-Master) cuja
              atribuição não segue apenas a faixa etária.
            </p>

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
