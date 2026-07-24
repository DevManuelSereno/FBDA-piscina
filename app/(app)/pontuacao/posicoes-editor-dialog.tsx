"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ListOrdered, Plus, Trash2 } from "lucide-react";
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
import type { PosicaoPontos } from "@/lib/scoring";
import { posicoesFormSchema, type PosicoesFormInput } from "@/lib/validations";
import { salvarPosicoes } from "./actions";

export function PosicoesEditorDialog({
  regraId,
  regraNome,
  posicoesIniciais,
}: {
  regraId: string;
  regraNome: string;
  posicoesIniciais: PosicaoPontos[];
}) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultValues: PosicoesFormInput = { posicoes: posicoesIniciais };

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PosicoesFormInput>({
    resolver: zodResolver(posicoesFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "posicoes" });

  function onOpenChange(novoOpen: boolean) {
    if (novoOpen) {
      reset(defaultValues);
      setServerError(null);
    }
    setOpen(novoOpen);
  }

  function adicionarLinha() {
    const proximaPosicao =
      fields.length > 0
        ? Math.max(...fields.map((f) => f.posicao)) + 1
        : 1;
    append({ posicao: proximaPosicao, pontos: 0 });
  }

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      const resultado = await salvarPosicoes(regraId, data.posicoes);
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
          <Button variant="outline" size="sm">
            <ListOrdered className="size-4" />
            Editar posições
          </Button>
        }
      />
      {open && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Posições — {regraNome}</DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="flex flex-col gap-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <Field>
                  <FieldLabel htmlFor={`posicao-${index}`} className="text-xs">
                    Posição
                  </FieldLabel>
                  <Input
                    id={`posicao-${index}`}
                    type="number"
                    min={1}
                    className="w-20"
                    {...register(`posicoes.${index}.posicao`, { valueAsNumber: true })}
                  />
                  <FieldError errors={[errors.posicoes?.[index]?.posicao]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`pontos-${index}`} className="text-xs">
                    Pontos
                  </FieldLabel>
                  <Input
                    id={`pontos-${index}`}
                    type="number"
                    min={0}
                    className="w-24"
                    {...register(`posicoes.${index}.pontos`, { valueAsNumber: true })}
                  />
                  <FieldError errors={[errors.posicoes?.[index]?.pontos]} />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remover posição ${field.posicao}`}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={adicionarLinha}
            >
              <Plus className="size-4" />
              Adicionar posição
            </Button>

            {(errors.posicoes?.message ?? errors.posicoes?.root?.message) && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {errors.posicoes.message ?? errors.posicoes.root?.message}
              </p>
            )}

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
