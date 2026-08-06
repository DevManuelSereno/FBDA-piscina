"use client";

import { usePathname, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

export type FiltrosMelhoresDoAnoValores = {
  circuitoId: string;
  temporada: string;
};

export function FiltrosMelhoresDoAno({
  valores,
  circuitos,
  temporadas,
}: {
  valores: FiltrosMelhoresDoAnoValores;
  circuitos: { id: string; nome: string }[];
  temporadas: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  function atualizar(patch: Partial<FiltrosMelhoresDoAnoValores>) {
    const novos = { ...valores, ...patch };
    const params = new URLSearchParams();
    if (novos.circuitoId) params.set("circuitoId", novos.circuitoId);
    if (novos.temporada) params.set("temporada", novos.temporada);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:max-w-xl sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="circuitoId">Circuito</Label>
        <NativeSelect
          id="circuitoId"
          value={valores.circuitoId}
          onChange={(e) => atualizar({ circuitoId: e.target.value })}
        >
          <option value="">Todos</option>
          {circuitos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="temporada">Temporada</Label>
        <NativeSelect
          id="temporada"
          value={valores.temporada}
          onChange={(e) => atualizar({ temporada: e.target.value })}
        >
          <option value="">Todas</option>
          {temporadas.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}
