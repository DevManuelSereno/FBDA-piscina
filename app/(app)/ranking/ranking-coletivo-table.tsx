import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RankingColetivoItem } from "@/lib/ranking";
import { PodioBadge } from "./podio-badge";

export function RankingColetivoTable({
  itens,
}: {
  itens: RankingColetivoItem[];
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
