"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { formatTime } from "@/lib/time";
import type { ResultadoStatus } from "@/lib/resultado";
import { salvarResultado } from "./actions";

export type LinhaResultado = {
  atletaId: string;
  nomeCompleto: string;
  clubeNome: string;
  categoriaId: string | null;
  categoriaLabel: string;
  status: ResultadoStatus;
  tempoCentesimos: number | null;
  colocacao: number | null;
};

type LinhaEstado = {
  status: ResultadoStatus;
  tempoRaw: string;
  colocacaoRaw: string;
  error: string | null;
  warning: string | null;
};

function tempoInputId(atletaId: string) {
  return `tempo-${atletaId}`;
}
function colocacaoInputId(atletaId: string) {
  return `colocacao-${atletaId}`;
}

export function ResultadosGrid({
  linhas,
  provaId,
  competicaoId,
  circuitoId,
}: {
  linhas: LinhaResultado[];
  provaId: string;
  competicaoId: string;
  circuitoId: string;
}) {
  const [estados, setEstados] = useState<Record<string, LinhaEstado>>(() =>
    Object.fromEntries(
      linhas.map((linha) => [
        linha.atletaId,
        {
          status: linha.status,
          tempoRaw:
            linha.tempoCentesimos !== null
              ? formatTime(linha.tempoCentesimos)
              : "",
          colocacaoRaw: linha.colocacao !== null ? String(linha.colocacao) : "",
          error: null,
          warning: null,
        },
      ]),
    ),
  );
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  function atualizarEstado(atletaId: string, patch: Partial<LinhaEstado>) {
    setEstados((prev) => ({
      ...prev,
      [atletaId]: { ...prev[atletaId], ...patch },
    }));
  }

  function salvar(
    linha: LinhaResultado,
    overrides?: Partial<
      Pick<LinhaEstado, "status" | "tempoRaw" | "colocacaoRaw">
    >,
  ) {
    if (!linha.categoriaId) return;
    const estado = { ...estados[linha.atletaId], ...overrides };

    setSavingIds((prev) => new Set(prev).add(linha.atletaId));
    startTransition(async () => {
      const resultado = await salvarResultado({
        atletaId: linha.atletaId,
        provaId,
        competicaoId,
        circuitoId,
        status: estado.status,
        tempoRaw: estado.tempoRaw,
        colocacaoRaw: estado.colocacaoRaw,
      });

      atualizarEstado(linha.atletaId, {
        error: resultado.error ?? null,
        warning: resultado.warning ?? null,
      });
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(linha.atletaId);
        return next;
      });
    });
  }

  function focarProximaLinha(
    atletaIdAtual: string,
    campo: "tempo" | "colocacao",
  ) {
    const indiceAtual = linhas.findIndex((l) => l.atletaId === atletaIdAtual);
    const proxima = linhas[indiceAtual + 1];
    if (!proxima) return;
    const id =
      campo === "tempo"
        ? tempoInputId(proxima.atletaId)
        : colocacaoInputId(proxima.atletaId);
    document.getElementById(id)?.focus();
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    linha: LinhaResultado,
    campo: "tempo" | "colocacao",
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      salvar(linha);
      focarProximaLinha(linha.atletaId, campo);
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Atleta</TableHead>
            <TableHead>Clube</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="w-32">Tempo</TableHead>
            <TableHead className="w-28">Colocação</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {linhas.map((linha) => {
            const estado = estados[linha.atletaId];
            const semCategoria = !linha.categoriaId;
            const isValido = estado.status === "VALIDO";
            const isSaving = savingIds.has(linha.atletaId);

            return (
              <TableRow key={linha.atletaId}>
                <TableCell className="font-medium">
                  {linha.nomeCompleto}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {linha.clubeNome}
                </TableCell>
                <TableCell>
                  {semCategoria ? (
                    <span className="flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle className="size-3.5" aria-hidden="true" />
                      Sem categoria
                    </span>
                  ) : (
                    linha.categoriaLabel
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    id={tempoInputId(linha.atletaId)}
                    aria-label={`Tempo de ${linha.nomeCompleto}`}
                    aria-invalid={!!estado.error}
                    placeholder="mm:ss.cc"
                    value={estado.tempoRaw}
                    disabled={semCategoria || !isValido}
                    onChange={(e) =>
                      atualizarEstado(linha.atletaId, {
                        tempoRaw: e.target.value,
                      })
                    }
                    onBlur={() => salvar(linha)}
                    onKeyDown={(e) => handleKeyDown(e, linha, "tempo")}
                  />
                  {estado.error && (
                    <p role="alert" className="mt-1 text-xs text-destructive">
                      {estado.error}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {estado.warning && (
                    <p className="mb-1 flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="size-3.5" aria-hidden="true" />
                      {estado.warning}
                    </p>
                  )}
                  <Input
                    id={colocacaoInputId(linha.atletaId)}
                    aria-label={`Colocação de ${linha.nomeCompleto}`}
                    type="number"
                    min={1}
                    value={estado.colocacaoRaw}
                    disabled={semCategoria || !isValido}
                    onChange={(e) =>
                      atualizarEstado(linha.atletaId, {
                        colocacaoRaw: e.target.value,
                      })
                    }
                    onBlur={() => salvar(linha)}
                    onKeyDown={(e) => handleKeyDown(e, linha, "colocacao")}
                  />
                </TableCell>
                <TableCell>
                  <NativeSelect
                    aria-label={`Status de ${linha.nomeCompleto}`}
                    value={estado.status}
                    disabled={semCategoria}
                    onChange={(e) => {
                      const status = e.target.value as ResultadoStatus;
                      atualizarEstado(linha.atletaId, { status });
                      salvar(linha, { status });
                    }}
                  >
                    <option value="VALIDO">Válido</option>
                    <option value="DQ">DQ</option>
                    <option value="DNS">DNS</option>
                  </NativeSelect>
                </TableCell>
                <TableCell>
                  {isSaving && (
                    <Loader2
                      className="size-4 animate-spin text-muted-foreground"
                      aria-label="Salvando"
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
