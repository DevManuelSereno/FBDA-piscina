import { prisma } from "@/lib/db";
import { inferirCategoria } from "@/lib/categoria";
import { AtletaFormDialog } from "./atleta-form-dialog";
import { AtletasTable } from "./atletas-table";
import type { AtletaRow } from "./columns";

export default async function AtletasPage() {
  const [atletas, clubes, categorias, circuitoPadrao] = await Promise.all([
    prisma.atleta.findMany({
      orderBy: { nomeCompleto: "asc" },
      include: { clube: true },
    }),
    prisma.clube.findMany({ orderBy: { nome: "asc" } }),
    prisma.categoria.findMany(),
    prisma.circuito.findFirst({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
    }),
  ]);

  // A "categoria atual" exibida aqui é só uma prévia sob o circuito padrão
  // (o de menor ordem) — o atleta pode competir em mais de um circuito;
  // a classificação real acontece por circuito na tela de Resultados.
  const hoje = new Date();
  const rows: AtletaRow[] = atletas.map((atleta) => {
    const categoria = circuitoPadrao
      ? inferirCategoria(
          atleta.dataNascimento,
          atleta.sexo,
          hoje,
          categorias,
          circuitoPadrao.id,
        )
      : null;
    return {
      id: atleta.id,
      nomeCompleto: atleta.nomeCompleto,
      dataNascimento: atleta.dataNascimento,
      sexo: atleta.sexo,
      clubeId: atleta.clubeId,
      clubeNome: atleta.clube.nome,
      ativo: atleta.ativo,
      numero: atleta.numero,
      categoriaAtual: categoria ? `${categoria.nome} (${categoria.sexo})` : null,
      circuitoAtualNome: circuitoPadrao?.nome ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Atletas</h1>
          <p className="text-muted-foreground">
            Atletas cadastrados, com a categoria atual calculada pela idade.
          </p>
        </div>
        <AtletaFormDialog mode="create" clubes={clubes} />
      </div>

      <AtletasTable rows={rows} clubes={clubes} />
    </div>
  );
}
