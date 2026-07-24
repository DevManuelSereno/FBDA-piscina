import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-primary via-primary to-[#0d3f70] p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            FBDA
          </span>
          <h1 className="font-heading text-2xl leading-snug font-medium">
            Ranking de Natação
          </h1>
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
