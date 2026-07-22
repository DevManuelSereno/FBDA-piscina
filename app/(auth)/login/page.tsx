import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-primary via-primary to-[#0d3f70] p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            FBDA
          </span>
          <CardTitle className="text-2xl">Ranking de Natação</CardTitle>
          <CardDescription>
            Entre com sua conta para gerenciar atletas, resultados e ranking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
