"use client";

import { usePathname, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

export type FiltrosMatrizValores = {
  circuitoId: string;
  sexo: string;
  temporada: string;
};

type FiltrosMatrizProps = {
  valores: FiltrosMatrizValores;
  circuitos: { id: string; nome: string }[];
  temporadas: string[];
};

export function FiltrosMatriz({
  valores,
  circuitos,
  temporadas,
}: FiltrosMatrizProps) {
  const router = useRouter();
  const pathname = usePathname();

  function atualizar(patch: Partial<FiltrosMatrizValores>) {
    const novos = { ...valores, ...patch };
    const params = new URLSearchParams();
    if (novos.circuitoId) params.set("circuitoId", novos.circuitoId);
    if (novos.sexo) params.set("sexo", novos.sexo);
    if (novos.temporada) params.set("temporada", novos.temporada);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:max-w-lg sm:grid-cols-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="circuitoId">Circuito</Label>
        <NativeSelect
          id="circuitoId"
          value={valores.circuitoId}
          onChange={(e) => atualizar({ circuitoId: e.target.value })}
        >
          {circuitos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="sexo">Sexo</Label>
        <NativeSelect
          id="sexo"
          value={valores.sexo}
          onChange={(e) => atualizar({ sexo: e.target.value })}
        >
          <option value="M">M</option>
          <option value="F">F</option>
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
