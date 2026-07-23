-- CreateTable
CREATE TABLE "PontuacaoCompeticao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "atletaId" TEXT NOT NULL,
    "competicaoId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "pontos" REAL NOT NULL DEFAULT 0,
    "origem" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PontuacaoCompeticao_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "Atleta" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PontuacaoCompeticao_competicaoId_fkey" FOREIGN KEY ("competicaoId") REFERENCES "Competicao" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PontuacaoCompeticao_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PontuacaoCompeticao_competicaoId_idx" ON "PontuacaoCompeticao"("competicaoId");

-- CreateIndex
CREATE INDEX "PontuacaoCompeticao_categoriaId_idx" ON "PontuacaoCompeticao"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "PontuacaoCompeticao_atletaId_competicaoId_key" ON "PontuacaoCompeticao"("atletaId", "competicaoId");
