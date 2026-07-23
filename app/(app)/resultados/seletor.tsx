"use client";

import { usePathname, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

type SeletorProps = {
  circuitos: { id: string; nome: string }[];
  competicoes: { id: string; nome: string }[];
  provas: { id: string; nome: string }[];
  circuitoIdAtual: string;
  competicaoIdAtual: string;
  provaIdAtual: string;
  mostrarProva: boolean;
};

export function SeletorCompeticaoProva({
  circuitos,
  competicoes,
  provas,
  circuitoIdAtual,
  competicaoIdAtual,
  provaIdAtual,
  mostrarProva,
}: SeletorProps) {
  const router = useRouter();
  const pathname = usePathname();

  function navegar(circuitoId: string, competicaoId: string, provaId: string) {
    const params = new URLSearchParams();
    if (circuitoId) params.set("circuitoId", circuitoId);
    if (competicaoId) params.set("competicaoId", competicaoId);
    if (provaId) params.set("provaId", provaId);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:max-w-2xl sm:grid-cols-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="circuitoId">Circuito</Label>
        <NativeSelect
          id="circuitoId"
          value={circuitoIdAtual}
          onChange={(event) =>
            // Muda o circuito zera competição/prova — não valem para o
            // novo circuito.
            navegar(event.target.value, "", "")
          }
        >
          {circuitos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="competicaoId">Competição</Label>
        <NativeSelect
          id="competicaoId"
          value={competicaoIdAtual}
          onChange={(event) =>
            navegar(circuitoIdAtual, event.target.value, "")
          }
        >
          <option value="">Selecione...</option>
          {competicoes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </NativeSelect>
      </div>
      {mostrarProva && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="provaId">Prova</Label>
          <NativeSelect
            id="provaId"
            value={provaIdAtual}
            onChange={(event) =>
              navegar(circuitoIdAtual, competicaoIdAtual, event.target.value)
            }
          >
            <option value="">Selecione...</option>
            {provas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </NativeSelect>
        </div>
      )}
    </div>
  );
}
