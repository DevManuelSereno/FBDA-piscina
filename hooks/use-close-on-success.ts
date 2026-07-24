import { useEffect, useState } from "react";
import { toast } from "sonner";

type ActionResult = { success?: boolean; mensagemSucesso?: string };

// Fecha um Dialog/AlertDialog quando uma Server Action (via useActionState)
// retorna sucesso. Usa o padrão "ajustar estado durante a renderização" em
// vez de useEffect — evita o aviso do eslint (react-hooks/set-state-in-effect)
// e o ciclo extra de re-render que um efeito causaria aqui.
export function useCloseOnSuccess<T extends ActionResult>(
  state: T,
  setOpen: (open: boolean) => void,
) {
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state.success) {
      setOpen(false);
    }
  }

  // O toast é um efeito colateral de verdade (mexe numa store externa ao
  // React), então mora num useEffect de verdade — só dispara quando a
  // referência de `state` muda (uma nova conclusão da Server Action), não
  // a cada re-render.
  useEffect(() => {
    if (state.success) {
      toast.success(state.mensagemSucesso ?? "Salvo com sucesso.");
    }
  }, [state]);
}
