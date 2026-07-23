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
import { Input } from "@/components/ui/input";
import { salvarPontuacaoManual } from "./actions";

export type LinhaLancamento = {
  atletaId: string;
  nomeCompleto: string;
  clubeNome: string;
  categoriaId: string | null;
  categoriaLabel: string;
  pontos: number | null;
};

type LinhaEstado = {
  pontosRaw: string;
  error: string | null;
};

function pontosInputId(atletaId: string) {
  return `pontos-${atletaId}`;
}

export function LancamentoGrid({
  linhas,
  competicaoId,
  circuitoId,
}: {
  linhas: LinhaLancamento[];
  competicaoId: string;
  circuitoId: string;
}) {
  const [estados, setEstados] = useState<Record<string, LinhaEstado>>(() =>
    Object.fromEntries(
      linhas.map((linha) => [
        linha.atletaId,
        {
          pontosRaw: linha.pontos !== null ? String(linha.pontos) : "",
          error: null,
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

  function salvar(linha: LinhaLancamento) {
    if (!linha.categoriaId) return;
    const estado = estados[linha.atletaId];

    setSavingIds((prev) => new Set(prev).add(linha.atletaId));
    startTransition(async () => {
      const resultado = await salvarPontuacaoManual({
        atletaId: linha.atletaId,
        competicaoId,
        circuitoId,
        pontosRaw: estado.pontosRaw,
      });

      atualizarEstado(linha.atletaId, { error: resultado.error ?? null });
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(linha.atletaId);
        return next;
      });
    });
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    linha: LinhaLancamento,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      salvar(linha);
      const indiceAtual = linhas.findIndex((l) => l.atletaId === linha.atletaId);
      const proxima = linhas[indiceAtual + 1];
      if (proxima) {
        document.getElementById(pontosInputId(proxima.atletaId))?.focus();
      }
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
            <TableHead className="w-32">Pontos</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {linhas.map((linha) => {
            const estado = estados[linha.atletaId];
            const semCategoria = !linha.categoriaId;
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
                    id={pontosInputId(linha.atletaId)}
                    aria-label={`Pontos de ${linha.nomeCompleto}`}
                    aria-invalid={!!estado.error}
                    type="number"
                    min={0}
                    step="any"
                    value={estado.pontosRaw}
                    disabled={semCategoria}
                    onChange={(e) =>
                      atualizarEstado(linha.atletaId, {
                        pontosRaw: e.target.value,
                      })
                    }
                    onBlur={() => salvar(linha)}
                    onKeyDown={(e) => handleKeyDown(e, linha)}
                  />
                  {estado.error && (
                    <p role="alert" className="mt-1 text-xs text-destructive">
                      {estado.error}
                    </p>
                  )}
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
