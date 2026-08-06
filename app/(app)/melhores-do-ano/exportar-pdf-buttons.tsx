import { FileDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { FiltrosMelhoresDoAnoValores } from "./filtros";

function montarQuery(
  valores: FiltrosMelhoresDoAnoValores,
  modo: "individual" | "coletivo",
) {
  const params = new URLSearchParams();
  params.set("modo", modo);
  if (valores.circuitoId) params.set("circuitoId", valores.circuitoId);
  if (valores.temporada) params.set("temporada", valores.temporada);
  return params.toString();
}

export function ExportarPdfButtons({
  valores,
}: {
  valores: FiltrosMelhoresDoAnoValores;
}) {
  return (
    <div className="flex shrink-0 gap-2">
      <a
        href={`/api/pdf/melhores-do-ano?${montarQuery(valores, "individual")}`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <FileDown className="size-4" />
        PDF Individual
      </a>
      <a
        href={`/api/pdf/melhores-do-ano?${montarQuery(valores, "coletivo")}`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <FileDown className="size-4" />
        PDF Coletivo
      </a>
    </div>
  );
}
