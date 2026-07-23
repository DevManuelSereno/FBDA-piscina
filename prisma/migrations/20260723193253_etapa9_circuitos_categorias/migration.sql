/*
  Warnings:

  - Added the required column `circuitoId` to the `Categoria` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Atleta" ADD COLUMN "numero" INTEGER;

-- CreateTable
CREATE TABLE "Circuito" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Categoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "idadeMin" INTEGER NOT NULL,
    "idadeMax" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "autoClassificavel" BOOLEAN NOT NULL DEFAULT true,
    "circuitoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Categoria_circuitoId_fkey" FOREIGN KEY ("circuitoId") REFERENCES "Circuito" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Categoria" ("createdAt", "id", "idadeMax", "idadeMin", "nome", "sexo", "updatedAt") SELECT "createdAt", "id", "idadeMax", "idadeMin", "nome", "sexo", "updatedAt" FROM "Categoria";
DROP TABLE "Categoria";
ALTER TABLE "new_Categoria" RENAME TO "Categoria";
CREATE UNIQUE INDEX "Categoria_circuitoId_nome_sexo_key" ON "Categoria"("circuitoId", "nome", "sexo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Circuito_nome_key" ON "Circuito"("nome");
