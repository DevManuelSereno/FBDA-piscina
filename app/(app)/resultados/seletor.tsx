"use client";

import { usePathname, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

type SeletorProps = {
  competicoes: { id: string; nome: string }[];
  provas: { id: string; nome: string }[];
  competicaoIdAtual: string;
  provaIdAtual: string;
};

export function SeletorCompeticaoProva({
  competicoes,
  provas,
  competicaoIdAtual,
  provaIdAtual,
}: SeletorProps) {
  const router = useRouter();
  const pathname = usePathname();

  function navegar(competicaoId: string, provaId: string) {
    const params = new URLSearchParams();
    if (competicaoId) params.set("competicaoId", competicaoId);
    if (provaId) params.set("provaId", provaId);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:max-w-md sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="competicaoId">Competição</Label>
        <NativeSelect
          id="competicaoId"
          value={competicaoIdAtual}
          onChange={(event) => navegar(event.target.value, provaIdAtual)}
        >
          <option value="">Selecione...</option>
          {competicoes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="provaId">Prova</Label>
        <NativeSelect
          id="provaId"
          value={provaIdAtual}
          onChange={(event) => navegar(competicaoIdAtual, event.target.value)}
        >
          <option value="">Selecione...</option>
          {provas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}
