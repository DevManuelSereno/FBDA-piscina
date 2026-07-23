"use client";

import { useActionState, useState } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCloseOnSuccess } from "@/hooks/use-close-on-success";
import { METODO_PONTUACAO } from "@/lib/validations";
import {
  createTipoCompeticao,
  updateTipoCompeticao,
  type ActionResult,
} from "./actions";

type TipoCompeticao = {
  id: string;
  nome: string;
  circuitoId: string;
  metodoPontuacao: string;
  grupoRelatorio: string;
  ordem: number;
  regraPontuacaoId: string | null;
};

type TipoCompeticaoFormDialogProps = (
  | { mode: "create" }
  | { mode: "edit"; tipo: TipoCompeticao }
) & {
  circuitos: { id: string; nome: string }[];
  regras: { id: string; nome: string }[];
};

const initialState: ActionResult = {};

export function TipoCompeticaoFormDialog(props: TipoCompeticaoFormDialogProps) {
  const [open, setOpen] = useState(false);
  const action =
    props.mode === "create"
      ? createTipoCompeticao
      : updateTipoCompeticao.bind(null, props.tipo.id);
  const [state, formAction, isPending] = useActionState(action, initialState);
  useCloseOnSuccess(state, setOpen);

  const tipo = props.mode === "edit" ? props.tipo : undefined;
  const [metodo, setMetodo] = useState(tipo?.metodoPontuacao ?? "COLOCACAO");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          props.mode === "create" ? (
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
          )
        }
      />
      {open && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {props.mode === "create"
                ? "Novo tipo de competição"
                : "Editar tipo de competição"}
            </DialogTitle>
          </DialogHeader>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="circuitoId">Circuito</Label>
              <NativeSelect
                id="circuitoId"
                name="circuitoId"
                defaultValue={tipo?.circuitoId ?? ""}
                required
              >
                <option value="" disabled>
                  Selecione um circuito
                </option>
                {props.circuitos.map((circuito) => (
                  <option key={circuito.id} value={circuito.id}>
                    {circuito.nome}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Ex.: Concurso, Regional, Fita Azul"
                defaultValue={tipo?.nome}
                required
                minLength={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="metodoPontuacao">Método de pontuação</Label>
                <NativeSelect
                  id="metodoPontuacao"
                  name="metodoPontuacao"
                  value={metodo}
                  onChange={(e) => setMetodo(e.target.value)}
                >
                  {METODO_PONTUACAO.map((m) => (
                    <option key={m} value={m}>
                      {m === "COLOCACAO" ? "Por colocação" : "Manual"}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ordem">Ordem</Label>
                <Input
                  id="ordem"
                  name="ordem"
                  type="number"
                  min={0}
                  defaultValue={tipo?.ordem ?? 0}
                  required
                />
              </div>
            </div>
            {metodo === "COLOCACAO" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="regraPontuacaoId">Regra de pontuação</Label>
                <NativeSelect
                  id="regraPontuacaoId"
                  name="regraPontuacaoId"
                  defaultValue={tipo?.regraPontuacaoId ?? ""}
                  required
                >
                  <option value="" disabled>
                    Selecione uma regra
                  </option>
                  {props.regras.map((regra) => (
                    <option key={regra.id} value={regra.id}>
                      {regra.nome}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="grupoRelatorio">Grupo no relatório</Label>
              <Input
                id="grupoRelatorio"
                name="grupoRelatorio"
                placeholder="Ex.: CONCURSO, CAMPEONATO, REGIONAL"
                defaultValue={tipo?.grupoRelatorio}
                required
                minLength={2}
              />
            </div>

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
