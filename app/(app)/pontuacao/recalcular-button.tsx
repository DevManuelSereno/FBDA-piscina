"use client";

import { useState, useTransition } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recalcularRanking } from "./actions";

export function RecalcularButton() {
  const [mensagem, setMensagem] = useState<{
    tipo: "sucesso" | "erro";
    texto: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function recalcular() {
    setMensagem(null);
    startTransition(async () => {
      const resultado = await recalcularRanking();
      if (resultado.error) {
        setMensagem({ tipo: "erro", texto: resultado.error });
      } else {
        setMensagem({
          tipo: "sucesso",
          texto: `${resultado.atualizados ?? 0} resultado(s) recalculado(s).`,
        });
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" onClick={recalcular} disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <RefreshCw className="size-4" aria-hidden="true" />
        )}
        Recalcular ranking
      </Button>
      {mensagem && (
        <p
          role="status"
          className={
            mensagem.tipo === "erro"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {mensagem.texto}
        </p>
      )}
    </div>
  );
}
