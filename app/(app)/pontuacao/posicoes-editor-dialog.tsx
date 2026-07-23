"use client";

import { useState, useTransition } from "react";
import { Loader2, ListOrdered, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { PosicaoPontos } from "@/lib/scoring";
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
  const [linhas, setLinhas] = useState<PosicaoPontos[]>(posicoesIniciais);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function abrir(novoOpen: boolean) {
    if (novoOpen) {
      setLinhas(posicoesIniciais);
      setError(null);
    }
    setOpen(novoOpen);
  }

  function atualizarLinha(index: number, patch: Partial<PosicaoPontos>) {
    setLinhas((prev) =>
      prev.map((linha, i) => (i === index ? { ...linha, ...patch } : linha)),
    );
  }

  function adicionarLinha() {
    const proximaPosicao =
      linhas.length > 0 ? Math.max(...linhas.map((l) => l.posicao)) + 1 : 1;
    setLinhas((prev) => [...prev, { posicao: proximaPosicao, pontos: 0 }]);
  }

  function removerLinha(index: number) {
    setLinhas((prev) => prev.filter((_, i) => i !== index));
  }

  function salvar() {
    setError(null);
    startTransition(async () => {
      const resultado = await salvarPosicoes(regraId, linhas);
      if (resultado.error) {
        setError(resultado.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={abrir}>
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

          <div className="flex flex-col gap-2">
            {linhas.map((linha, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`posicao-${index}`} className="text-xs">
                    Posição
                  </Label>
                  <Input
                    id={`posicao-${index}`}
                    type="number"
                    min={1}
                    className="w-20"
                    value={linha.posicao}
                    onChange={(e) =>
                      atualizarLinha(index, {
                        posicao: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`pontos-${index}`} className="text-xs">
                    Pontos
                  </Label>
                  <Input
                    id={`pontos-${index}`}
                    type="number"
                    min={0}
                    className="w-24"
                    value={linha.pontos}
                    onChange={(e) =>
                      atualizarLinha(index, {
                        pontos: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remover posição ${linha.posicao}`}
                  onClick={() => removerLinha(index)}
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
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" onClick={salvar} disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
