import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EficienciaClubeItem } from "@/lib/ranking";
import { EmptyState } from "@/components/empty-state";
import { PodioBadge } from "./podio-badge";

export function EficienciaClubeTable({
  itens,
}: {
  itens: EficienciaClubeItem[];
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
            <TableHead className="text-right">Atletas</TableHead>
            <TableHead className="text-right">Eficiência (pts/atleta)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itens.map((item) => (
            <TableRow key={item.clubeId}>
              <TableCell>
                <PodioBadge posicao={item.posicao} />
              </TableCell>
              <TableCell className="font-medium">{item.clubeNome}</TableCell>
              <TableCell className="text-right">{item.totalAtletas}</TableCell>
              <TableCell className="text-right font-semibold">
                {item.pontos.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
