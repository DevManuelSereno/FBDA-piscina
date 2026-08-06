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
import { METODO_PONTUACAO, tipoCompeticaoSchema, type TipoCompeticaoInput } from "@/lib/validations";
import { GRUPOS_RELATORIO } from "@/lib/relatorio-matriz";
import { createTipoCompeticao, updateTipoCompeticao } from "./actions";

type TipoCompeticao = {
  id: string;
  nome: string;
  circuitoId: string;
  metodoPontuacao: string;
  grupoRelatorio: string;
  ordem: number;
  regraPontuacaoId: string | null;
  regraPontuacaoForaId: string | null;
};

type TipoCompeticaoFormDialogProps = (
  | { mode: "create" }
  | { mode: "edit"; tipo: TipoCompeticao }
) & {
  circuitos: { id: string; nome: string }[];
  regras: { id: string; nome: string }[];
};

export function TipoCompeticaoFormDialog(props: TipoCompeticaoFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const tipo = props.mode === "edit" ? props.tipo : undefined;

  const defaultValues: TipoCompeticaoInput = {
    circuitoId: tipo?.circuitoId ?? "",
    nome: tipo?.nome ?? "",
    metodoPontuacao: (tipo?.metodoPontuacao as TipoCompeticaoInput["metodoPontuacao"]) ?? "COLOCACAO",
    ordem: tipo?.ordem ?? 0,
    regraPontuacaoId: tipo?.regraPontuacaoId ?? undefined,
    regraPontuacaoForaId: tipo?.regraPontuacaoForaId ?? undefined,
    grupoRelatorio: (tipo?.grupoRelatorio as TipoCompeticaoInput["grupoRelatorio"]) ?? GRUPOS_RELATORIO[0].value,
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TipoCompeticaoInput>({
    resolver: zodResolver(tipoCompeticaoSchema),
    defaultValues,
  });

  const metodo = watch("metodoPontuacao");

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
          ? await createTipoCompeticao(data)
          : await updateTipoCompeticao(props.tipo.id, data);
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
            Novo tipo
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Editar ${props.tipo.nome}`}
          >
            <Pencil className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      {open && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {props.mode === "create"
                ? "Novo tipo de competição"
                : "Editar tipo de competição"}
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
              <Input
                id="nome"
                placeholder="Ex.: Concurso, Regional, Fita Azul"
                {...register("nome")}
              />
              <FieldError errors={[errors.nome]} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="metodoPontuacao">Método de pontuação</FieldLabel>
                <NativeSelect id="metodoPontuacao" {...register("metodoPontuacao")}>
                  {METODO_PONTUACAO.map((m) => (
                    <option key={m} value={m}>
                      {m === "COLOCACAO" ? "Por colocação" : "Manual"}
                    </option>
                  ))}
                </NativeSelect>
                <FieldError errors={[errors.metodoPontuacao]} />
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
            {metodo === "COLOCACAO" && (
              <Field>
                <FieldLabel htmlFor="regraPontuacaoId">Regra de pontuação</FieldLabel>
                <NativeSelect id="regraPontuacaoId" {...register("regraPontuacaoId")}>
                  <option value="" disabled>
                    Selecione uma regra
                  </option>
                  {props.regras.map((regra) => (
                    <option key={regra.id} value={regra.id}>
                      {regra.nome}
                    </option>
                  ))}
                </NativeSelect>
                <FieldError errors={[errors.regraPontuacaoId]} />
              </Field>
            )}
            {metodo === "COLOCACAO" && (
              <Field>
                <FieldLabel htmlFor="regraPontuacaoForaId">
                  Regra de pontuação (fora de Salvador)
                </FieldLabel>
                <NativeSelect id="regraPontuacaoForaId" {...register("regraPontuacaoForaId")}>
                  <option value="">Mesma regra, qualquer local</option>
                  {props.regras.map((regra) => (
                    <option key={regra.id} value={regra.id}>
                      {regra.nome}
                    </option>
                  ))}
                </NativeSelect>
                <p className="text-xs text-muted-foreground">
                  Opcional. Se não selecionada, a regra acima vale para
                  competições em Salvador e fora de Salvador.
                </p>
                <FieldError errors={[errors.regraPontuacaoForaId]} />
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="grupoRelatorio">Grupo no relatório</FieldLabel>
              <NativeSelect id="grupoRelatorio" {...register("grupoRelatorio")}>
                <option value="" disabled>
                  Selecione um grupo
                </option>
                {GRUPOS_RELATORIO.map((grupo) => (
                  <option key={grupo.value} value={grupo.value}>
                    {grupo.label}
                  </option>
                ))}
              </NativeSelect>
              <FieldError errors={[errors.grupoRelatorio]} />
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
