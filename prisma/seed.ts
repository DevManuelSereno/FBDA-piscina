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
  await prisma.circuito.deleteMany();
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

  // Circuitos: rankings independentes, refletindo as duas planilhas reais
  // do cliente (ver extras/). Cada circuito tem suas próprias classes.
  const [circuitoJovem, circuitoMaster] = await Promise.all([
    prisma.circuito.create({
      data: { nome: "Infantil a Sênior", ordem: 1 },
    }),
    prisma.circuito.create({ data: { nome: "Master", ordem: 2 } }),
  ]);

  // Circuito "Infantil a Sênior": os NOMES das classes (INF1, INF2, JV1,
  // JV2, J1, J2, SR) vêm da planilha real do cliente (extras/Infantil a
  // Sênior - Masculino.xlsx). A planilha NÃO informa idade/data de
  // nascimento — por isso os cortes de idade abaixo são PLACEHOLDER,
  // ainda não confirmados pela FBDA. Ajustar assim que o cliente informar
  // os cortes oficiais (ver docs/decisions.md).
  const classesJovem: {
    nome: string;
    idadeMin: number;
    idadeMax: number;
    ordem: number;
  }[] = [
    { nome: "INF1", idadeMin: 10, idadeMax: 11, ordem: 1 },
    { nome: "INF2", idadeMin: 12, idadeMax: 13, ordem: 2 },
    { nome: "JV1", idadeMin: 14, idadeMax: 14, ordem: 3 },
    { nome: "JV2", idadeMin: 15, idadeMax: 15, ordem: 4 },
    { nome: "J1", idadeMin: 16, idadeMax: 16, ordem: 5 },
    { nome: "J2", idadeMin: 17, idadeMax: 17, ordem: 6 },
    { nome: "SR", idadeMin: 18, idadeMax: 99, ordem: 7 },
  ];

  // Circuito "Master": as classes SÃO faixas etárias explícitas na planilha
  // real (extras/Master - Masculino.xlsx) — 25+, 30+, ..., 75+ — não há
  // invenção aqui. "PRE" e "PCD" também aparecem na planilha, mas não são
  // faixas etárias (PRE = pré-master; PCD = pessoa com deficiência), por
  // isso ficam com autoClassificavel=false (cadastradas, sem auto-atribuição
  // por idade).
  const bandasMaster = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75];
  const classesMaster: {
    nome: string;
    idadeMin: number;
    idadeMax: number;
    ordem: number;
    autoClassificavel: boolean;
  }[] = [
    { nome: "PRE", idadeMin: 18, idadeMax: 24, ordem: 0, autoClassificavel: false },
    ...bandasMaster.map((min, index) => ({
      nome: `${min}+`,
      idadeMin: min,
      idadeMax: index === bandasMaster.length - 1 ? 99 : bandasMaster[index + 1] - 1,
      ordem: index + 1,
      autoClassificavel: true,
    })),
    { nome: "PCD", idadeMin: 0, idadeMax: 99, ordem: 99, autoClassificavel: false },
  ];

  await Promise.all([
    ...classesJovem.flatMap((c) =>
      ["M", "F"].map((sexo) =>
        prisma.categoria.create({
          data: {
            nome: c.nome,
            sexo,
            idadeMin: c.idadeMin,
            idadeMax: c.idadeMax,
            ordem: c.ordem,
            circuitoId: circuitoJovem.id,
          },
        }),
      ),
    ),
    ...classesMaster.flatMap((c) =>
      ["M", "F"].map((sexo) =>
        prisma.categoria.create({
          data: {
            nome: c.nome,
            sexo,
            idadeMin: c.idadeMin,
            idadeMax: c.idadeMax,
            ordem: c.ordem,
            autoClassificavel: c.autoClassificavel,
            circuitoId: circuitoMaster.id,
          },
        }),
      ),
    ),
  ]);

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
        numero: 1,
      },
    }),
    prisma.atleta.create({
      data: {
        nomeCompleto: "Bruno Costa Lima",
        dataNascimento: new Date("2008-11-03"),
        sexo: "M",
        clubeId: clubeMunicipal.id,
        numero: 2,
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
