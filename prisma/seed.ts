import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function limparBanco() {
  // Ordem reversa de dependência — mantém o seed idempotente em dev.
  await prisma.pontuacaoPosicao.deleteMany();
  await prisma.regraPontuacao.deleteMany();
  await prisma.resultado.deleteMany();
  await prisma.atleta.deleteMany();
  await prisma.competicao.deleteMany();
  await prisma.prova.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.clube.deleteMany();
  await prisma.usuario.deleteMany();
}

async function main() {
  await limparBanco();

  const [clubeMunicipal, clubeBaia, clubeGolfinhos] = await Promise.all([
    prisma.clube.create({
      data: { nome: "Piscina Municipal", sigla: "PM", cidade: "Salvador" },
    }),
    prisma.clube.create({
      data: { nome: "Clube Aquático Baía", sigla: "CAB", cidade: "Salvador" },
    }),
    prisma.clube.create({
      data: {
        nome: "Golfinhos Natação",
        sigla: "GN",
        cidade: "Lauro de Freitas",
      },
    }),
  ]);

  const categoriasData = [
    { nome: "Petiz", sexo: "M", idadeMin: 0, idadeMax: 10 },
    { nome: "Petiz", sexo: "F", idadeMin: 0, idadeMax: 10 },
    { nome: "Infantil", sexo: "M", idadeMin: 11, idadeMax: 12 },
    { nome: "Infantil", sexo: "F", idadeMin: 11, idadeMax: 12 },
    { nome: "Juvenil", sexo: "M", idadeMin: 13, idadeMax: 14 },
    { nome: "Juvenil", sexo: "F", idadeMin: 13, idadeMax: 14 },
    { nome: "Júnior", sexo: "M", idadeMin: 15, idadeMax: 17 },
    { nome: "Júnior", sexo: "F", idadeMin: 15, idadeMax: 17 },
    { nome: "Sênior", sexo: "M", idadeMin: 18, idadeMax: 99 },
    { nome: "Sênior", sexo: "F", idadeMin: 18, idadeMax: 99 },
  ];
  await Promise.all(
    categoriasData.map((c) => prisma.categoria.create({ data: c })),
  );

  await Promise.all(
    [
      { nome: "50m Livre", estilo: "LIVRE", distancia: 50, piscina: "25m" },
      { nome: "100m Livre", estilo: "LIVRE", distancia: 100, piscina: "25m" },
      { nome: "50m Costas", estilo: "COSTAS", distancia: 50, piscina: "25m" },
      { nome: "100m Peito", estilo: "PEITO", distancia: 100, piscina: "25m" },
      {
        nome: "200m Medley",
        estilo: "MEDLEY",
        distancia: 200,
        piscina: "25m",
      },
    ].map((p) => prisma.prova.create({ data: p })),
  );

  await prisma.competicao.create({
    data: {
      nome: "1ª Etapa Estadual 2026",
      data: new Date("2026-03-15"),
      local: "Piscina Municipal - Salvador",
      temporada: "2026",
    },
  });

  await Promise.all([
    prisma.atleta.create({
      data: {
        nomeCompleto: "Ana Beatriz Souza",
        dataNascimento: new Date("2009-04-12"),
        sexo: "F",
        clubeId: clubeMunicipal.id,
      },
    }),
    prisma.atleta.create({
      data: {
        nomeCompleto: "Bruno Costa Lima",
        dataNascimento: new Date("2008-11-03"),
        sexo: "M",
        clubeId: clubeMunicipal.id,
      },
    }),
    prisma.atleta.create({
      data: {
        nomeCompleto: "Carla Menezes",
        dataNascimento: new Date("2007-06-20"),
        sexo: "F",
        clubeId: clubeBaia.id,
      },
    }),
    prisma.atleta.create({
      data: {
        nomeCompleto: "Daniel Andrade",
        dataNascimento: new Date("2006-01-15"),
        sexo: "M",
        clubeId: clubeBaia.id,
      },
    }),
    prisma.atleta.create({
      data: {
        nomeCompleto: "Eduarda Ramos",
        dataNascimento: new Date("2005-09-30"),
        sexo: "F",
        clubeId: clubeGolfinhos.id,
      },
    }),
    prisma.atleta.create({
      data: {
        nomeCompleto: "Felipe Nogueira",
        dataNascimento: new Date("2004-02-08"),
        sexo: "M",
        clubeId: clubeGolfinhos.id,
      },
    }),
  ]);

  // Regra de pontuação padrão por colocação (1º ao 8º lugar).
  await prisma.regraPontuacao.create({
    data: {
      nome: "Colocação Padrão (1º-8º)",
      tipo: "COLOCACAO",
      ativo: true,
      posicoes: {
        create: [9, 7, 6, 5, 4, 3, 2, 1].map((pontos, index) => ({
          posicao: index + 1,
          pontos,
        })),
      },
    },
  });

  const senhaHash = await bcrypt.hash("piscina123", 10);
  await prisma.usuario.create({
    data: {
      email: "admin@fbda.local",
      senhaHash,
      nome: "Administrador",
      papel: "ADMIN",
    },
  });

  console.log("Seed concluído.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
