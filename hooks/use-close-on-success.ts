import { useState } from "react";

type ActionResult = { success?: boolean };

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
}
