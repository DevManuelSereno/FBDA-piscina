-- CreateTable
CREATE TABLE "Clube" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "sigla" TEXT,
    "cidade" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "idadeMin" INTEGER NOT NULL,
    "idadeMax" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Atleta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomeCompleto" TEXT NOT NULL,
    "dataNascimento" DATETIME NOT NULL,
    "sexo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "clubeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Atleta_clubeId_fkey" FOREIGN KEY ("clubeId") REFERENCES "Clube" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prova" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "estilo" TEXT NOT NULL,
    "distancia" INTEGER NOT NULL,
    "piscina" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Competicao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "local" TEXT,
    "temporada" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Resultado" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "atletaId" TEXT NOT NULL,
    "provaId" TEXT NOT NULL,
    "competicaoId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "tempoCentesimos" INTEGER,
    "colocacao" INTEGER,
    "pontos" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'VALIDO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resultado_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "Atleta" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Resultado_provaId_fkey" FOREIGN KEY ("provaId") REFERENCES "Prova" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Resultado_competicaoId_fkey" FOREIGN KEY ("competicaoId") REFERENCES "Competicao" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Resultado_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegraPontuacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PontuacaoPosicao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regraId" TEXT NOT NULL,
    "posicao" INTEGER NOT NULL,
    "pontos" REAL NOT NULL,
    CONSTRAINT "PontuacaoPosicao_regraId_fkey" FOREIGN KEY ("regraId") REFERENCES "RegraPontuacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'EDITOR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Clube_nome_key" ON "Clube"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_sexo_key" ON "Categoria"("nome", "sexo");

-- CreateIndex
CREATE INDEX "Atleta_clubeId_idx" ON "Atleta"("clubeId");

-- CreateIndex
CREATE UNIQUE INDEX "Prova_nome_distancia_estilo_piscina_key" ON "Prova"("nome", "distancia", "estilo", "piscina");

-- CreateIndex
CREATE INDEX "Resultado_competicaoId_provaId_idx" ON "Resultado"("competicaoId", "provaId");

-- CreateIndex
CREATE INDEX "Resultado_categoriaId_idx" ON "Resultado"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "Resultado_atletaId_provaId_competicaoId_key" ON "Resultado"("atletaId", "provaId", "competicaoId");

-- CreateIndex
CREATE UNIQUE INDEX "PontuacaoPosicao_regraId_posicao_key" ON "PontuacaoPosicao"("regraId", "posicao");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
