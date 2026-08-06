-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Competicao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "local" TEXT,
    "temporada" TEXT,
    "localTipo" TEXT NOT NULL DEFAULT 'SALVADOR',
    "tipoCompeticaoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Competicao_tipoCompeticaoId_fkey" FOREIGN KEY ("tipoCompeticaoId") REFERENCES "TipoCompeticao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Competicao" ("createdAt", "data", "id", "local", "nome", "temporada", "tipoCompeticaoId", "updatedAt") SELECT "createdAt", "data", "id", "local", "nome", "temporada", "tipoCompeticaoId", "updatedAt" FROM "Competicao";
DROP TABLE "Competicao";
ALTER TABLE "new_Competicao" RENAME TO "Competicao";
CREATE INDEX "Competicao_tipoCompeticaoId_idx" ON "Competicao"("tipoCompeticaoId");
CREATE TABLE "new_TipoCompeticao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "metodoPontuacao" TEXT NOT NULL,
    "grupoRelatorio" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "circuitoId" TEXT NOT NULL,
    "regraPontuacaoId" TEXT,
    "regraPontuacaoForaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TipoCompeticao_circuitoId_fkey" FOREIGN KEY ("circuitoId") REFERENCES "Circuito" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TipoCompeticao_regraPontuacaoId_fkey" FOREIGN KEY ("regraPontuacaoId") REFERENCES "RegraPontuacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TipoCompeticao_regraPontuacaoForaId_fkey" FOREIGN KEY ("regraPontuacaoForaId") REFERENCES "RegraPontuacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TipoCompeticao" ("circuitoId", "createdAt", "grupoRelatorio", "id", "metodoPontuacao", "nome", "ordem", "regraPontuacaoId", "updatedAt") SELECT "circuitoId", "createdAt", "grupoRelatorio", "id", "metodoPontuacao", "nome", "ordem", "regraPontuacaoId", "updatedAt" FROM "TipoCompeticao";
DROP TABLE "TipoCompeticao";
ALTER TABLE "new_TipoCompeticao" RENAME TO "TipoCompeticao";
CREATE UNIQUE INDEX "TipoCompeticao_circuitoId_nome_key" ON "TipoCompeticao"("circuitoId", "nome");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
