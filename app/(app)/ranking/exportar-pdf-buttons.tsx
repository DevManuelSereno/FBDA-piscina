import { FileDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { FiltrosRankingValores } from "./filtros";

function montarQuery(valores: FiltrosRankingValores, modo: "individual" | "coletivo") {
  const params = new URLSearchParams();
  params.set("modo", modo);
  params.set("tipo", valores.tipo);
  if (valores.circuitoId) params.set("circuitoId", valores.circuitoId);
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
      <a
        href={`/api/pdf/ranking?${montarQuery(valores, "individual")}`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <FileDown className="size-4" />
        PDF Individual
      </a>
      <a
        href={`/api/pdf/ranking?${montarQuery(valores, "coletivo")}`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <FileDown className="size-4" />
        PDF Coletivo
      </a>
    </div>
  );
}
