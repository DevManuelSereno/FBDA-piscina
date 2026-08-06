import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MelhoresDoAnoColetivoItem } from "@/lib/melhores-do-ano";
import { EmptyState } from "@/components/empty-state";
import { PodioBadge } from "./podio-badge";

export function MelhoresDoAnoColetivoTable({
  itens,
}: {
  itens: MelhoresDoAnoColetivoItem[];
}) {
  if (itens.length === 0) {
    return (
      <EmptyState>
        Nenhum resultado encontrado para os filtros selecionados.
      </EmptyState>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Clube</TableHead>
            <TableHead className="text-right">Pontos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itens.map((item) => (
            <TableRow key={item.clubeId}>
              <TableCell>
                <PodioBadge posicao={item.posicao} />
              </TableCell>
              <TableCell className="font-medium">{item.clubeNome}</TableCell>
              <TableCell className="text-right font-semibold">
                {item.pontos}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
