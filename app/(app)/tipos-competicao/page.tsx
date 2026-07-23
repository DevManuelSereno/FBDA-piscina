import { prisma } from "@/lib/db";
import { TipoCompeticaoFormDialog } from "./tipo-competicao-form-dialog";
import { TiposCompeticaoTable } from "./tipos-competicao-table";
import type { TipoCompeticaoRow } from "./columns";

export default async function TiposCompeticaoPage() {
  const [tipos, circuitos, regras] = await Promise.all([
    prisma.tipoCompeticao.findMany({
      include: { circuito: true, regraPontuacao: true },
      orderBy: [{ circuito: { ordem: "asc" } }, { ordem: "asc" }],
    }),
    prisma.circuito.findMany({ orderBy: { ordem: "asc" } }),
    prisma.regraPontuacao.findMany({ orderBy: { nome: "asc" } }),
  ]);

  const rows: TipoCompeticaoRow[] = tipos.map((t) => ({
    id: t.id,
    nome: t.nome,
    circuitoId: t.circuitoId,
    circuitoNome: t.circuito.nome,
    metodoPontuacao: t.metodoPontuacao,
    grupoRelatorio: t.grupoRelatorio,
    ordem: t.ordem,
    regraPontuacaoId: t.regraPontuacaoId,
    regraNome: t.regraPontuacao?.nome ?? null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Tipos de Competição
          </h1>
          <p className="text-muted-foreground">
            Define o nível de cada competição dentro do circuito (Concurso,
            Regional, Brasileiro...) e como ela é pontuada.
          </p>
        </div>
        <TipoCompeticaoFormDialog mode="create" circuitos={circuitos} regras={regras} />
      </div>

      <TiposCompeticaoTable rows={rows} circuitos={circuitos} regras={regras} />
    </div>
  );
}
