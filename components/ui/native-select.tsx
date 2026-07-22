import * as React from "react";
import { cn } from "@/lib/utils";

// Select nativo do navegador em vez do primitivo Select do shadcn/Base UI:
// mais simples e confiável para conjuntos pequenos e fixos de opções, e
// evita depender do mesmo mecanismo de popup (floating-ui) que apresentou
// bugs de abertura no primitivo Menu nesta stack.
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        className,
      )}
      {...props}
    />
  );
}

export { NativeSelect };
