"use client";

import { useTransition } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { recalcularRanking } from "./actions";

export function RecalcularButton() {
  const [isPending, startTransition] = useTransition();

  function recalcular() {
    startTransition(async () => {
      const resultado = await recalcularRanking();
      if (resultado.error) {
        toast.error(resultado.error);
      } else {
        toast.success(`${resultado.atualizados ?? 0} resultado(s) recalculado(s).`);
      }
    });
  }

  return (
    <Button variant="outline" onClick={recalcular} disabled={isPending}>
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <RefreshCw className="size-4" aria-hidden="true" />
      )}
      Recalcular ranking
    </Button>
  );
}
