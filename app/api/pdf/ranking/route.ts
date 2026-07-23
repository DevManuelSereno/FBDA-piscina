import { renderToBuffer } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buscarRanking, type FiltrosRankingQuery } from "@/lib/ranking-query";
import { criarDocumentoRanking, type FiltrosLabel } from "./ranking-pdf-document";

export async function GET(request: NextRequest) {
  // /api/* fica fora do matcher do proxy.ts (ver proxy.ts), então esta rota
  // precisa da própria checagem de sessão — não pode depender só do proxy.
  const session = await auth();
  if (!session?.user) {
    return new Response("Não autorizado", { status: 401 });
  }

  const params = request.nextUrl.searchParams;

  const filtros: FiltrosRankingQuery = {
    tipo: params.get("tipo") === "provisorio" ? "provisorio" : "completo",
    competicaoId: params.get("competicaoId") ?? "",
    categoriaId: params.get("categoriaId") ?? "",
    clubeId: params.get("clubeId") ?? "",
    sexo: params.get("sexo") ?? "",
    temporada: params.get("temporada") ?? "",
  };
  const modo = params.get("modo") === "coletivo" ? "coletivo" : "individual";

  const [{ individual, coletivo }, competicao, categoria, clube] =
    await Promise.all([
      buscarRanking(filtros),
      filtros.competicaoId
        ? prisma.competicao.findUnique({ where: { id: filtros.competicaoId } })
        : null,
      filtros.categoriaId
        ? prisma.categoria.findUnique({ where: { id: filtros.categoriaId } })
        : null,
      filtros.clubeId
        ? prisma.clube.findUnique({ where: { id: filtros.clubeId } })
        : null,
    ]);

  const escopo =
    filtros.tipo === "provisorio"
      ? `Provisório — ${competicao?.nome ?? "todas as competições"}`
      : `Completo — ${filtros.temporada ? `Temporada ${filtros.temporada}` : "todas as temporadas"}`;

  const filtrosLabel: FiltrosLabel = {
    escopo,
    categoriaNome: categoria ? `${categoria.nome} (${categoria.sexo})` : undefined,
    clubeNome: clube?.nome,
    sexo: filtros.sexo || undefined,
  };

  const documento = criarDocumentoRanking(
    modo,
    { individual, coletivo },
    filtrosLabel,
  );

  const buffer = await renderToBuffer(documento);
  const nomeArquivo = `ranking-${modo}-${filtros.tipo}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
