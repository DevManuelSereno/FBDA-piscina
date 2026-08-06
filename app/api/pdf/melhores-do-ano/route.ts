import { renderToBuffer } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  buscarMelhoresDoAno,
  type FiltrosMelhoresDoAnoQuery,
} from "@/lib/melhores-do-ano-query";
import {
  criarDocumentoMelhoresDoAno,
  type FiltrosLabelMelhoresDoAno,
} from "./melhores-do-ano-pdf-document";

export async function GET(request: NextRequest) {
  // /api/* fica fora do matcher do proxy.ts (ver proxy.ts), então esta rota
  // precisa da própria checagem de sessão — não pode depender só do proxy.
  const session = await auth();
  if (!session?.user) {
    return new Response("Não autorizado", { status: 401 });
  }

  const params = request.nextUrl.searchParams;

  const filtros: FiltrosMelhoresDoAnoQuery = {
    circuitoId: params.get("circuitoId") ?? "",
    temporada: params.get("temporada") ?? "",
  };
  const modo = params.get("modo") === "coletivo" ? "coletivo" : "individual";

  const [{ individual, coletivo }, circuito] = await Promise.all([
    buscarMelhoresDoAno(filtros),
    filtros.circuitoId
      ? prisma.circuito.findUnique({ where: { id: filtros.circuitoId } })
      : null,
  ]);

  const filtrosLabel: FiltrosLabelMelhoresDoAno = {
    circuitoNome: circuito?.nome,
    temporada: filtros.temporada || undefined,
  };

  const documento = criarDocumentoMelhoresDoAno(
    modo,
    { individual, coletivo },
    filtrosLabel,
  );

  const buffer = await renderToBuffer(documento);
  const nomeArquivo = `melhores-do-ano-${modo}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
