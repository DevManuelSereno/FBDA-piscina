import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RankingIndividualItem } from "@/lib/ranking";
import { PodioBadge } from "./podio-badge";

export function RankingIndividualTable({
  itens,
}: {
  itens: RankingIndividualItem[];
}) {
  if (itens.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed p-6 text-muted-foreground">
        Nenhum resultado encontrado para os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Atleta</TableHead>
            <TableHead>Clube</TableHead>
            <TableHead className="text-right">Pontos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itens.map((item, index) => (
            <TableRow key={item.atletaId}>
              <TableCell>
                <PodioBadge posicao={index + 1} />
              </TableCell>
              <TableCell className="font-medium">{item.atletaNome}</TableCell>
              <TableCell className="text-muted-foreground">
                {item.clubeNome}
              </TableCell>
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
