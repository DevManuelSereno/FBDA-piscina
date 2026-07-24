"use client";

import { useActionState, useState } from "react";
import { CalendarIcon, Loader2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCloseOnSuccess } from "@/hooks/use-close-on-success";
import { SEXO_ATLETA } from "@/lib/validations";
import type { ActionResult } from "@/lib/action-result";
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

const initialState: ActionResult = {};

function toIsoDateValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

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
  const action =
    props.mode === "create"
      ? createAtleta
      : updateAtleta.bind(null, props.atleta.id);
  const [state, formAction, isPending] = useActionState(action, initialState);
  useCloseOnSuccess(state, setOpen);

  const atleta = props.mode === "edit" ? props.atleta : undefined;

  const [dataNascimento, setDataNascimento] = useState<Date | undefined>(
    atleta?.dataNascimento,
  );
  const [dataNascimentoTexto, setDataNascimentoTexto] = useState(
    atleta ? formatDataPtBr(atleta.dataNascimento) : "",
  );
  const [calendarioAberto, setCalendarioAberto] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nomeCompleto">Nome completo</Label>
              <Input
                id="nomeCompleto"
                name="nomeCompleto"
                defaultValue={atleta?.nomeCompleto}
                required
                minLength={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="dataNascimentoTexto">
                  Data de nascimento
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="dataNascimentoTexto"
                    placeholder="dd/mm/aaaa"
                    value={dataNascimentoTexto}
                    onChange={(e) => {
                      setDataNascimentoTexto(e.target.value);
                      const parsed = parseDataPtBr(e.target.value);
                      if (parsed) setDataNascimento(parsed);
                    }}
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    <Popover
                      open={calendarioAberto}
                      onOpenChange={(open, eventDetails) => {
                        // O select nativo de mês/ano do Calendar abre seu
                        // dropdown fora da árvore do DOM (é renderizado pelo
                        // navegador/SO) — o Base UI interpreta isso como o
                        // foco saindo do Popover ("focus-out") e fecha antes
                        // do usuário conseguir escolher a opção. Ignorar
                        // esse motivo específico não afeta o fechamento por
                        // clique fora, Esc ou seleção de dia.
                        if (!open && eventDetails.reason === "focus-out") return;
                        setCalendarioAberto(open);
                      }}
                    >
                      <PopoverTrigger
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
                        <PopoverContent align="end" className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dataNascimento}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              if (!date) return;
                              setDataNascimento(date);
                              setDataNascimentoTexto(formatDataPtBr(date));
                              setCalendarioAberto(false);
                            }}
                          />
                        </PopoverContent>
                      )}
                    </Popover>
                  </InputGroupAddon>
                </InputGroup>
                <input
                  type="hidden"
                  name="dataNascimento"
                  value={dataNascimento ? toIsoDateValue(dataNascimento) : ""}
                />
              </Field>
              <div className="flex flex-col gap-2">
                <Label htmlFor="sexo">Sexo</Label>
                <NativeSelect id="sexo" name="sexo" defaultValue={atleta?.sexo ?? "F"}>
                  {SEXO_ATLETA.map((sexo) => (
                    <option key={sexo} value={sexo}>
                      {sexo}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="numero">Número de inscrição (opcional)</Label>
              <Input
                id="numero"
                name="numero"
                type="number"
                min={1}
                defaultValue={atleta?.numero ?? undefined}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="clubeId">Clube</Label>
              <NativeSelect
                id="clubeId"
                name="clubeId"
                defaultValue={atleta?.clubeId ?? ""}
                required
              >
                <option value="" disabled>
                  Selecione um clube
                </option>
                {props.clubes.map((clube) => (
                  <option key={clube.id} value={clube.id}>
                    {clube.nome}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="ativo"
                defaultChecked={atleta?.ativo ?? true}
                className="size-4 cursor-pointer rounded border-input"
              />
              Ativo
            </label>

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
