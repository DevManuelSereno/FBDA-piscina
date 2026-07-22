import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Singleton do Prisma Client para Next.js — evita múltiplas conexões
// durante hot-reload em desenvolvimento.
// SQLite (dev) usa o adapter LibSQL: mesma engine do SQLite, mas com
// binários pré-compilados (não exige node-gyp/Visual Studio no Windows,
// diferente do @prisma/adapter-better-sqlite3).
// Em produção (Postgres), trocar por @prisma/adapter-pg.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
