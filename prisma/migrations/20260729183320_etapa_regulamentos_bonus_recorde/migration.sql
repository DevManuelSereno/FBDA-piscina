-- AlterTable
ALTER TABLE "Resultado" ADD COLUMN "recordeTipo" TEXT;

-- CreateTable
CREATE TABLE "PontuacaoRecorde" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipoRecorde" TEXT NOT NULL,
    "pontos" REAL NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "circuitoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PontuacaoRecorde_circuitoId_fkey" FOREIGN KEY ("circuitoId") REFERENCES "Circuito" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PontuacaoRecorde_circuitoId_tipoRecorde_key" ON "PontuacaoRecorde"("circuitoId", "tipoRecorde");
