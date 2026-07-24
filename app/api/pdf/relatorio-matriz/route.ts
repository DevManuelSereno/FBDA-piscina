import { renderToBuffer } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buscarMatriz, type FiltrosMatrizQuery } from "@/lib/relatorio-matriz-query";
import { criarDocumentoRelatorioMatriz } from "./relatorio-matriz-pdf-document";

export async function GET(request: NextRequest) {
  // /api/* fica fora do matcher do proxy.ts (ver proxy.ts), então esta rota
  // precisa da própria checagem de sessão — não pode depender só do proxy.
  const session = await auth();
  if (!session?.user) {
    return new Response("Não autorizado", { status: 401 });
  }

  const params = request.nextUrl.searchParams;

  const filtros: FiltrosMatrizQuery = {
    circuitoId: params.get("circuitoId") ?? "",
    sexo: params.get("sexo") === "F" ? "F" : "M",
    temporada: params.get("temporada") ?? "",
  };

  const [{ colunas, grupos, linhas }, circuito] = await Promise.all([
    buscarMatriz(filtros),
    filtros.circuitoId
      ? prisma.circuito.findUnique({ where: { id: filtros.circuitoId } })
      : null,
  ]);

  const documento = criarDocumentoRelatorioMatriz({
    colunas,
    grupos,
    linhas,
    filtros: {
      circuitoNome: circuito?.nome ?? "—",
      sexo: filtros.sexo,
      temporada: filtros.temporada || undefined,
    },
  });

  const buffer = await renderToBuffer(documento);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="relatorio-matriz.pdf"`,
    },
  });
}
