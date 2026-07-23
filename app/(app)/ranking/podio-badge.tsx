import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const CORES_PODIO: Record<number, string> = {
  1: "bg-accent text-accent-foreground",
  2: "bg-muted text-foreground",
  3: "bg-muted/60 text-foreground",
};

export function PodioBadge({ posicao }: { posicao: number }) {
  const classe = CORES_PODIO[posicao];

  if (!classe) {
    return (
      <span className="flex size-6 items-center justify-center text-sm text-muted-foreground">
        {posicao}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex size-6 items-center justify-center rounded-full text-xs font-bold",
        classe,
      )}
    >
      {posicao <= 3 ? <Trophy className="size-3.5" aria-hidden="true" /> : posicao}
    </span>
  );
}
