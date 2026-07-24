import { Fragment } from "react";
import type { ColunaMatriz } from "@/lib/relatorio-matriz-query";
import type { MatrizLinha } from "@/lib/relatorio-matriz";

const LABEL_GRUPO: Record<string, string> = {
  CONCURSO: "Concursos",
  CAMPEONATO: "Campeonatos",
  REGIONAL: "Regionais",
  BRASILEIRO_CATEGORIAS: "Brasileiro de Categorias",
  BRASILEIRO_ABSOLUTO: "Brasileiro Absoluto",
  FITA_AZUL: "Fita Azul",
};

function labelGrupo(grupo: string) {
  return LABEL_GRUPO[grupo] ?? grupo;
}

export function MatrizTable({
  colunas,
  grupos,
  linhas,
}: {
  colunas: ColunaMatriz[];
  grupos: string[];
  linhas: MatrizLinha[];
}) {
  if (linhas.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed p-6 text-muted-foreground">
        Nenhum resultado encontrado para os filtros selecionados.
      </div>
    );
  }

  const colunasPorGrupo = grupos.map((grupo) => ({
    grupo,
    colunas: colunas.filter((c) => c.grupoRelatorio === grupo),
  }));
  const totalColunas = 2 + colunas.length + colunasPorGrupo.length + 1;

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full min-w-max text-xs">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th
              rowSpan={2}
              className="sticky left-0 z-10 min-w-40 border-b border-r bg-background px-2 py-1.5 text-left font-medium"
            >
              Atleta
            </th>
            <th
              rowSpan={2}
              className="border-b border-r px-2 py-1.5 text-left font-medium"
            >
              Clube
            </th>
            {colunasPorGrupo.map(({ grupo, colunas: colunasGrupo }) => (
              <th
                key={grupo}
                colSpan={colunasGrupo.length + 1}
                className="border-b border-r px-2 py-1.5 text-center font-medium whitespace-nowrap"
              >
                {labelGrupo(grupo)}
              </th>
            ))}
            <th
              rowSpan={2}
              className="border-b px-2 py-1.5 text-right font-medium"
            >
              Total
            </th>
          </tr>
          <tr>
            {colunasPorGrupo.map(({ grupo, colunas: colunasGrupo }) => (
              <Fragment key={grupo}>
                {colunasGrupo.map((coluna) => (
                  <th
                    key={coluna.id}
                    className="border-b px-2 py-1.5 text-right font-medium whitespace-nowrap"
                    title={coluna.nome}
                  >
                    {coluna.nome}
                  </th>
                ))}
                <th className="border-b border-r px-2 py-1.5 text-right font-semibold whitespace-nowrap">
                  Subtotal
                </th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, index) => {
            const novaCategoria =
              linhas[index - 1]?.categoriaNome !== linha.categoriaNome;

            return (
              <Fragment key={linha.atletaId}>
                {novaCategoria && (
                  <tr>
                    <td
                      colSpan={totalColunas}
                      className="border-b bg-muted/30 px-2 py-1 font-semibold"
                    >
                      {linha.categoriaNome}
                    </td>
                  </tr>
                )}
                <tr className="hover:bg-muted/20">
                  <td className="sticky left-0 z-10 border-r bg-background px-2 py-1 font-medium whitespace-nowrap">
                    {linha.atletaNome}
                  </td>
                  <td className="border-r px-2 py-1 whitespace-nowrap text-muted-foreground">
                    {linha.clubeNome}
                  </td>
                  {colunasPorGrupo.map(({ grupo, colunas: colunasGrupo }) => (
                    <Fragment key={grupo}>
                      {colunasGrupo.map((coluna) => (
                        <td
                          key={coluna.id}
                          className="px-2 py-1 text-right tabular-nums"
                        >
                          {linha.pontosPorCompeticao[coluna.id] ?? "—"}
                        </td>
                      ))}
                      <td className="border-r px-2 py-1 text-right font-semibold tabular-nums">
                        {linha.subtotaisPorGrupo[grupo] ?? 0}
                      </td>
                    </Fragment>
                  ))}
                  <td className="px-2 py-1 text-right font-bold tabular-nums">
                    {linha.total}
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
