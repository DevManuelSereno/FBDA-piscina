"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ativarRegra, deleteRegra } from "./actions";

export function RegraRowActions({
  id,
  nome,
  ativo,
}: {
  id: string;
  nome: string;
  ativo: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAtivando, startAtivar] = useTransition();
  const [isExcluindo, startExcluir] = useTransition();

  function ativar() {
    startAtivar(async () => {
      await ativarRegra(id);
    });
  }

  function excluir() {
    setError(null);
    startExcluir(async () => {
      const resultado = await deleteRegra(id);
      if (resultado.error) {
        setError(resultado.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      {!ativo && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={ativar}
          disabled={isAtivando}
        >
          {isAtivando ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="size-4" aria-hidden="true" />
          )}
          Ativar
        </Button>
      )}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${nome}`}>
              <Trash2 className="size-4" />
            </Button>
          }
        />
        {open && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir regra</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir <strong>{nome}</strong>? Essa
                ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={excluir}
                disabled={isExcluindo}
              >
                {isExcluindo && (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                )}
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </div>
  );
}
