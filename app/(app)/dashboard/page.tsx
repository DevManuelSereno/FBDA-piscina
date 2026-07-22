import { Building2, ClipboardList, Trophy, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const [clubes, atletas, competicoes, resultados] = await Promise.all([
    prisma.clube.count(),
    prisma.atleta.count(),
    prisma.competicao.count(),
    prisma.resultado.count(),
  ]);

  const stats = [
    { label: "Clubes", value: clubes, icon: Building2 },
    { label: "Atletas", value: atletas, icon: Users },
    { label: "Competições", value: competicoes, icon: Trophy },
    { label: "Resultados lançados", value: resultados, icon: ClipboardList },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de ranking da FBDA.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
