"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { CalendarIcon, Loader2, Pencil, Plus, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SEXO_ATLETA, atletaSchema, type AtletaInput } from "@/lib/validations";
import { createAtleta, updateAtleta } from "./actions";

type Atleta = {
  id: string;
  nomeCompleto: string;
  dataNascimento: Date;
  sexo: string;
  clubeId: string;
  ativo: boolean;
  numero: number | null;
};

type AtletaFormDialogProps = (
  | { mode: "create" }
  | { mode: "edit"; atleta: Atleta }
) & {
  clubes: { id: string; nome: string }[];
};

function formatDataPtBr(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

// Aceita apenas dd/mm/aaaa (formato exibido no campo) — o usuário também
// pode escolher a data pelo Calendar, que já entrega um Date direto.
function parseDataPtBr(value: string): Date | undefined {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;
  const [, dia, mes, ano] = match;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  if (
    data.getFullYear() !== Number(ano) ||
    data.getMonth() !== Number(mes) - 1 ||
    data.getDate() !== Number(dia)
  ) {
    return undefined;
  }
  return data;
}

export function AtletaFormDialog(props: AtletaFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [calendarioAberto, setCalendarioAberto] = useState(false);

  const atleta = props.mode === "edit" ? props.atleta : undefined;

  // dataNascimento fica undefined na criação — não faz sentido pré-preencher
  // com "hoje", e um valor padrão "hoje" na prática sempre falharia a
  // validação de "não pode ser no futuro" (a checagem usa o momento em que
  // o schema foi carregado, sempre um instante antes do submit).
  const defaultValues = {
    nomeCompleto: atleta?.nomeCompleto ?? "",
    dataNascimento: atleta?.dataNascimento,
    sexo: (atleta?.sexo as AtletaInput["sexo"]) ?? "F",
    clubeId: atleta?.clubeId ?? "",
    ativo: atleta?.ativo ?? true,
    numero: atleta?.numero ?? undefined,
  };

  const [dataNascimentoTexto, setDataNascimentoTexto] = useState(
    atleta ? formatDataPtBr(atleta.dataNascimento) : "",
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AtletaInput>({
    resolver: zodResolver(atletaSchema),
    defaultValues,
  });

  function onOpenChange(novoOpen: boolean) {
    if (novoOpen) {
      reset(defaultValues);
      setDataNascimentoTexto(atleta ? formatDataPtBr(atleta.dataNascimento) : "");
      setServerError(null);
    }
    setOpen(novoOpen);
  }

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      const resultado =
        props.mode === "create"
          ? await createAtleta(data)
          : await updateAtleta(props.atleta.id, data);
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
              Novo atleta
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Editar ${props.atleta.nomeCompleto}`}
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
              {props.mode === "create" ? "Novo atleta" : "Editar atleta"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="nomeCompleto">Nome completo</FieldLabel>
              <Input id="nomeCompleto" {...register("nomeCompleto")} />
              <FieldError errors={[errors.nomeCompleto]} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="dataNascimentoTexto">
                  Data de nascimento
                </FieldLabel>
                <Controller
                  control={control}
                  name="dataNascimento"
                  render={({ field }) => (
                    <InputGroup>
                      <InputGroupInput
                        id="dataNascimentoTexto"
                        placeholder="dd/mm/aaaa"
                        value={dataNascimentoTexto}
                        onChange={(e) => {
                          setDataNascimentoTexto(e.target.value);
                          const parsed = parseDataPtBr(e.target.value);
                          if (parsed) field.onChange(parsed);
                        }}
                      />
                      <InputGroupAddon align="inline-end">
                        {/* O <select> nativo de mês/ano do Calendar não abre
                            de forma confiável quando um ancestral usa
                            `transform` CSS (é um bug cross-browser conhecido:
                            navegadores posicionam o dropdown nativo em relação
                            ao espaço de coordenadas transformado, e o popup
                            pode falhar ao abrir ou fechar instantaneamente).
                            O DialogContent padrão do projeto centraliza via
                            `-translate-x-1/2 -translate-y-1/2`, então trocar
                            de Popover para Dialog sozinho não resolvia — o
                            usuário confirmou por vídeo que o bug persistia.
                            Aqui montamos o popup manualmente com os
                            primitivos do Base UI, centralizando por flexbox
                            (sem transform) especificamente para este
                            calendário aninhado. */}
                        <Dialog open={calendarioAberto} onOpenChange={setCalendarioAberto}>
                          <DialogTrigger
                            render={
                              <InputGroupButton
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Abrir calendário"
                              >
                                <CalendarIcon className="size-4" aria-hidden="true" />
                              </InputGroupButton>
                            }
                          />
                          {calendarioAberto && (
                            <DialogPortal>
                              <DialogOverlay />
                              <DialogPrimitive.Popup
                                data-slot="dialog-content"
                                className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none"
                              >
                                <div className="flex flex-col gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10">
                                  <div className="flex items-center justify-between gap-4">
                                    <DialogTitle>Data de nascimento</DialogTitle>
                                    <DialogPrimitive.Close
                                      render={<Button variant="ghost" size="icon-sm" />}
                                    >
                                      <XIcon />
                                      <span className="sr-only">Fechar</span>
                                    </DialogPrimitive.Close>
                                  </div>
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                      if (!date) return;
                                      field.onChange(date);
                                      setDataNascimentoTexto(formatDataPtBr(date));
                                      setCalendarioAberto(false);
                                    }}
                                  />
                                </div>
                              </DialogPrimitive.Popup>
                            </DialogPortal>
                          )}
                        </Dialog>
                      </InputGroupAddon>
                    </InputGroup>
                  )}
                />
                <FieldError errors={[errors.dataNascimento]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="sexo">Sexo</FieldLabel>
                <NativeSelect id="sexo" {...register("sexo")}>
                  {SEXO_ATLETA.map((sexo) => (
                    <option key={sexo} value={sexo}>
                      {sexo}
                    </option>
                  ))}
                </NativeSelect>
                <FieldError errors={[errors.sexo]} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="numero">Número de inscrição (opcional)</FieldLabel>
              <Input
                id="numero"
                type="number"
                min={1}
                {...register("numero", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
              <FieldError errors={[errors.numero]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="clubeId">Clube</FieldLabel>
              <NativeSelect id="clubeId" {...register("clubeId")}>
                <option value="" disabled>
                  Selecione um clube
                </option>
                {props.clubes.map((clube) => (
                  <option key={clube.id} value={clube.id}>
                    {clube.nome}
                  </option>
                ))}
              </NativeSelect>
              <FieldError errors={[errors.clubeId]} />
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
