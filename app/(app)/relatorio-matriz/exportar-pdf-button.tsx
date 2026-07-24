import { FileDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { FiltrosMatrizValores } from "./filtros";

function montarQuery(valores: FiltrosMatrizValores) {
  const params = new URLSearchParams();
  params.set("circuitoId", valores.circuitoId);
  params.set("sexo", valores.sexo);
  if (valores.temporada) params.set("temporada", valores.temporada);
  return params.toString();
}

export function ExportarPdfButton({
  valores,
}: {
  valores: FiltrosMatrizValores;
}) {
  return (
    <a
      href={`/api/pdf/relatorio-matriz?${montarQuery(valores)}`}
      className={buttonVariants({ variant: "outline", size: "sm" })}
    >
      <FileDown className="size-4" />
      Exportar PDF
    </a>
  );
}
