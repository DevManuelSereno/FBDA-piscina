"use client";

import { usePathname, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

export type FiltrosRankingValores = {
  tipo: "completo" | "provisorio";
  circuitoId: string;
  competicaoId: string;
  categoriaId: string;
  clubeId: string;
  sexo: string;
  temporada: string;
};

type FiltrosRankingProps = {
  valores: FiltrosRankingValores;
  circuitos: { id: string; nome: string }[];
  competicoes: { id: string; nome: string }[];
  categorias: { id: string; nome: string; sexo: string }[];
  clubes: { id: string; nome: string }[];
  temporadas: string[];
};

export function FiltrosRanking({
  valores,
  circuitos,
  competicoes,
  categorias,
  clubes,
  temporadas,
}: FiltrosRankingProps) {
  const router = useRouter();
  const pathname = usePathname();

  function atualizar(patch: Partial<FiltrosRankingValores>) {
    const novos = { ...valores, ...patch };
    // Trocar de circuito invalida a categoria selecionada (ela pertence
    // a um circuito específico).
    if (patch.circuitoId !== undefined) {
      novos.categoriaId = "";
    }
    const params = new URLSearchParams();
    if (novos.tipo) params.set("tipo", novos.tipo);
    if (novos.circuitoId) params.set("circuitoId", novos.circuitoId);
    if (novos.tipo === "provisorio" && novos.competicaoId) {
      params.set("competicaoId", novos.competicaoId);
    }
    if (novos.tipo === "completo" && novos.temporada) {
      params.set("temporada", novos.temporada);
    }
    if (novos.categoriaId) params.set("categoriaId", novos.categoriaId);
    if (novos.clubeId) params.set("clubeId", novos.clubeId);
    if (novos.sexo) params.set("sexo", novos.sexo);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
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
        <Label htmlFor="tipo">Escopo</Label>
        <NativeSelect
          id="tipo"
          value={valores.tipo}
          onChange={(e) =>
            atualizar({
              tipo: e.target.value as "completo" | "provisorio",
            })
          }
        >
          <option value="completo">Completo (temporada)</option>
          <option value="provisorio">Provisório (1 competição)</option>
        </NativeSelect>
      </div>

      {valores.tipo === "provisorio" ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="competicaoId">Competição</Label>
          <NativeSelect
            id="competicaoId"
            value={valores.competicaoId}
            onChange={(e) => atualizar({ competicaoId: e.target.value })}
          >
            <option value="">Selecione...</option>
            {competicoes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </NativeSelect>
        </div>
      ) : (
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
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="categoriaId">Categoria</Label>
        <NativeSelect
          id="categoriaId"
          value={valores.categoriaId}
          onChange={(e) => atualizar({ categoriaId: e.target.value })}
        >
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} ({c.sexo})
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="clubeId">Clube</Label>
        <NativeSelect
          id="clubeId"
          value={valores.clubeId}
          onChange={(e) => atualizar({ clubeId: e.target.value })}
        >
          <option value="">Todos</option>
          {clubes.map((c) => (
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
          <option value="">Todos</option>
          <option value="M">M</option>
          <option value="F">F</option>
        </NativeSelect>
      </div>
    </div>
  );
}
