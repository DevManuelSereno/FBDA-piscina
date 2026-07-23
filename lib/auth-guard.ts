import { auth } from "@/auth";

// Server Actions não são cobertas pelo matcher do proxy.ts se a rota
// mudar (ver proxy.ts) — cada action precisa da própria checagem, não
// pode depender só do proxy (já causou um bug real em app/api/pdf/ranking).
export async function requireAuth(): Promise<{ error: string } | null> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Não autorizado." };
  }
  return null;
}
