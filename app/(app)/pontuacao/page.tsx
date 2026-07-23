import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegraFormDialog } from "./regra-form-dialog";
import { PosicoesEditorDialog } from "./posicoes-editor-dialog";
import { RegraRowActions } from "./regra-row-actions";
import { RecalcularButton } from "./recalcular-button";

export default async function PontuacaoPage() {
  const regras = await prisma.regraPontuacao.findMany({
    orderBy: { createdAt: "asc" },
    include: { posicoes: { orderBy: { posicao: "asc" } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pontuação</h1>
          <p className="text-muted-foreground">
            Regras de posição → pontos usadas para calcular o ranking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RecalcularButton />
          <RegraFormDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {regras.map((regra) => (
          <Card key={regra.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{regra.nome}</CardTitle>
                <span
                  className={
                    regra.ativo
                      ? "rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  }
                >
                  {regra.ativo ? "Ativa" : "Inativa"}
                </span>
              </div>
              <RegraRowActions id={regra.id} nome={regra.nome} ativo={regra.ativo} />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Tipo: {regra.tipo === "COLOCACAO" ? "Por colocação" : "Por tempo (FINA)"}
              </p>
              <div className="flex flex-wrap gap-2">
                {regra.posicoes.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Nenhuma posição configurada.
                  </span>
                ) : (
                  regra.posicoes.map((p) => (
                    <span
                      key={p.id}
                      className="rounded-md border px-2 py-1 text-xs"
                    >
                      {p.posicao}º = {p.pontos}pts
                    </span>
                  ))
                )}
              </div>
              <PosicoesEditorDialog
                regraId={regra.id}
                regraNome={regra.nome}
                posicoesIniciais={regra.posicoes.map((p) => ({
                  posicao: p.posicao,
                  pontos: p.pontos,
                }))}
              />
            </CardContent>
          </Card>
        ))}

        {regras.length === 0 && (
          <div className="flex items-center gap-2 rounded-md border border-dashed p-6 text-muted-foreground lg:col-span-2">
            Nenhuma regra cadastrada. Crie a primeira regra de pontuação.
          </div>
        )}
      </div>
    </div>
  );
}
