import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { RecordesEditorDialog } from "./recordes-editor-dialog";

export const metadata: Metadata = {
  title: "Bônus de Recorde",
};

export default async function PontuacaoRecordePage() {
  const circuitos = await prisma.circuito.findMany({
    orderBy: { ordem: "asc" },
    include: { pontuacaoRecordes: { orderBy: { ordem: "asc" } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bônus de Recorde</h1>
        <p className="text-muted-foreground">
          Pontos extras somados à colocação quando um atleta bate um recorde
          (Baiano, Brasileiro, Sul-Americano, Mundial). Escala própria por
          circuito.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {circuitos.map((circuito) => (
          <Card key={circuito.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{circuito.nome}</CardTitle>
              <RecordesEditorDialog
                circuitoId={circuito.id}
                circuitoNome={circuito.nome}
                recordesIniciais={circuito.pontuacaoRecordes.map((r) => ({
                  tipoRecorde: r.tipoRecorde,
                  pontos: r.pontos,
                }))}
              />
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {circuito.pontuacaoRecordes.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  Nenhum bônus configurado.
                </span>
              ) : (
                circuito.pontuacaoRecordes.map((r) => (
                  <span
                    key={r.id}
                    className="rounded-md border px-2 py-1 text-xs"
                  >
                    {r.tipoRecorde} = {r.pontos}pts
                  </span>
                ))
              )}
            </CardContent>
          </Card>
        ))}

        {circuitos.length === 0 && (
          <EmptyState className="lg:col-span-2">
            Nenhum circuito cadastrado.
          </EmptyState>
        )}
      </div>
    </div>
  );
}
