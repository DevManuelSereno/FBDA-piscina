"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Medal, Plus, Trash2 } from "lucide-react";
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
import type { PontuacaoRecordeItem } from "@/lib/scoring";
import { recordesFormSchema, type RecordesFormInput } from "@/lib/validations";
import { salvarRecordes } from "./actions";

export function RecordesEditorDialog({
  circuitoId,
  circuitoNome,
  recordesIniciais,
}: {
  circuitoId: string;
  circuitoNome: string;
  recordesIniciais: PontuacaoRecordeItem[];
}) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultValues: RecordesFormInput = { recordes: recordesIniciais };

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecordesFormInput>({
    resolver: zodResolver(recordesFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "recordes" });

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
      const resultado = await salvarRecordes(circuitoId, data.recordes);
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
        <Button variant="outline" size="sm">
          <Medal className="size-4" />
          Editar bônus de recorde
        </Button>
      </DialogTrigger>
      {open && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bônus de recorde — {circuitoNome}</DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="flex flex-col gap-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <Field className="flex-1">
                  <FieldLabel htmlFor={`tipoRecorde-${index}`} className="text-xs">
                    Tipo de recorde
                  </FieldLabel>
                  <Input
                    id={`tipoRecorde-${index}`}
                    placeholder="Ex.: Baiano Absoluto"
                    {...register(`recordes.${index}.tipoRecorde`)}
                  />
                  <FieldError errors={[errors.recordes?.[index]?.tipoRecorde]} />
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
                    {...register(`recordes.${index}.pontos`, { valueAsNumber: true })}
                  />
                  <FieldError errors={[errors.recordes?.[index]?.pontos]} />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remover ${field.tipoRecorde}`}
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
              onClick={() => append({ tipoRecorde: "", pontos: 0 })}
            >
              <Plus className="size-4" />
              Adicionar recorde
            </Button>

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
