import { Button } from "@/components/ui/button";

// Página placeholder da Etapa 0 — apenas comprova que a fundação do projeto
// (Next.js + Tailwind v4 + shadcn/ui + identidade visual FBDA) está no ar.
// Será substituída pelo shell real da aplicação na Etapa 2 (auth + dashboard).
export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 bg-background p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Etapa 0 — Fundação
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Sistema de Ranking <span className="text-primary">FBDA</span>
        </h1>
        <p className="max-w-md text-base text-muted-foreground">
          Next.js + TypeScript + Tailwind v4 + shadcn/ui, com a identidade
          visual da Federação Baiana de Desportos Aquáticos.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button>Botão primário</Button>
        <Button variant="secondary">Secundário</Button>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Destaque (pódio)
        </Button>
        <Button variant="outline">Contorno</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Primary", className: "bg-primary" },
          { label: "Secondary", className: "bg-secondary border" },
          { label: "Accent", className: "bg-accent" },
          { label: "Sidebar", className: "bg-sidebar" },
        ].map((swatch) => (
          <div key={swatch.label} className="flex flex-col items-center gap-1">
            <div className={`h-12 w-20 rounded-md ${swatch.className}`} />
            <span className="text-xs text-muted-foreground">{swatch.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
