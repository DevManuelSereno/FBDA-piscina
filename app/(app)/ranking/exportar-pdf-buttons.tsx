import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FiltrosRankingValores } from "./filtros";

function montarQuery(valores: FiltrosRankingValores, modo: "individual" | "coletivo") {
  const params = new URLSearchParams();
  params.set("modo", modo);
  params.set("tipo", valores.tipo);
  if (valores.tipo === "provisorio" && valores.competicaoId) {
    params.set("competicaoId", valores.competicaoId);
  }
  if (valores.tipo === "completo" && valores.temporada) {
    params.set("temporada", valores.temporada);
  }
  if (valores.categoriaId) params.set("categoriaId", valores.categoriaId);
  if (valores.clubeId) params.set("clubeId", valores.clubeId);
  if (valores.sexo) params.set("sexo", valores.sexo);
  return params.toString();
}

export function ExportarPdfButtons({
  valores,
}: {
  valores: FiltrosRankingValores;
}) {
  return (
    <div className="flex shrink-0 gap-2">
      <Button
        variant="outline"
        size="sm"
        render={
          <a href={`/api/pdf/ranking?${montarQuery(valores, "individual")}`} />
        }
      >
        <FileDown className="size-4" />
        PDF Individual
      </Button>
      <Button
        variant="outline"
        size="sm"
        render={
          <a href={`/api/pdf/ranking?${montarQuery(valores, "coletivo")}`} />
        }
      >
        <FileDown className="size-4" />
        PDF Coletivo
      </Button>
    </div>
  );
}
