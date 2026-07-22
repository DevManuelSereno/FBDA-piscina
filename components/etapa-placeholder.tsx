import { Construction } from "lucide-react";

export function EtapaPlaceholder({
  titulo,
  etapa,
}: {
  titulo: string;
  etapa: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
      <div className="flex items-center gap-2 rounded-md border border-dashed p-6 text-muted-foreground">
        <Construction className="size-5 shrink-0" />
        <p>
          Esta seção será implementada na <strong>{etapa}</strong> do
          roadmap.
        </p>
      </div>
    </div>
  );
}
