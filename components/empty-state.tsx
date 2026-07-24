import { cn } from "@/lib/utils";

// min-w-0 no container e no filho evita que o texto force overflow
// horizontal em containers estreitos (flex items não encolhem abaixo da
// largura intrínseca do conteúdo por padrão).
export function EmptyState({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-md border border-dashed p-6 text-muted-foreground",
        className,
      )}
    >
      <span className="min-w-0">{children}</span>
    </div>
  );
}
