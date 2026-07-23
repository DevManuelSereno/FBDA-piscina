import { describe, expect, test } from "vitest";
import { calcularIdadeNoAno, inferirCategoria, type CategoriaRange } from "./categoria";

describe("calcularIdadeNoAno", () => {
  test("calcula pela diferença de anos, não pela data exata do aniversário", () => {
    // Nascido em dezembro; aniversário ainda não ocorreu na referência de janeiro,
    // mas a regra de categorias de base é pela idade completada NO ANO da competição.
    const nascimento = new Date("2010-12-20");
    const referencia = new Date("2026-01-10");
    expect(calcularIdadeNoAno(nascimento, referencia)).toBe(16);
  });

  test("mesma data de nascimento e referência resulta em idade 0", () => {
    const data = new Date("2020-05-01");
    expect(calcularIdadeNoAno(data, data)).toBe(0);
  });
});

describe("inferirCategoria", () => {
  const circuitoJovem = "circ-jovem";
  const circuitoMaster = "circ-master";

  const categorias: CategoriaRange[] = [
    { id: "1", nome: "Petiz", sexo: "F", idadeMin: 0, idadeMax: 10, circuitoId: circuitoJovem, autoClassificavel: true },
    { id: "2", nome: "Infantil", sexo: "F", idadeMin: 11, idadeMax: 12, circuitoId: circuitoJovem, autoClassificavel: true },
    { id: "3", nome: "Júnior", sexo: "F", idadeMin: 15, idadeMax: 17, circuitoId: circuitoJovem, autoClassificavel: true },
    { id: "4", nome: "Sênior", sexo: "M", idadeMin: 18, idadeMax: 99, circuitoId: circuitoJovem, autoClassificavel: true },
    { id: "5", nome: "Livre", sexo: "MISTO", idadeMin: 0, idadeMax: 99, circuitoId: circuitoJovem, autoClassificavel: true },
  ];

  test("encontra a categoria cujo intervalo de idade e sexo correspondem", () => {
    const nascimento = new Date("2010-05-01");
    const referencia = new Date("2026-03-15"); // idade no ano = 16
    const categoria = inferirCategoria(nascimento, "F", referencia, categorias, circuitoJovem);
    expect(categoria?.nome).toBe("Júnior");
  });

  test("categoria MISTO combina com qualquer sexo do atleta", () => {
    // Fixture não tem "Sênior" feminino — só a categoria MISTO cobre essa idade.
    const nascimento = new Date("2000-01-01");
    const referencia = new Date("2026-01-01"); // idade 26
    const categoria = inferirCategoria(nascimento, "F", referencia, categorias, circuitoJovem);
    expect(categoria?.nome).toBe("Livre");
  });

  test("retorna null quando nenhuma categoria compatível existe", () => {
    const categoriasSemLivre = categorias.filter((c) => c.nome !== "Livre");
    const nascimento = new Date("2000-01-01");
    const referencia = new Date("2026-01-01"); // idade 26, sexo F, nada cobre isso sem Livre
    const categoria = inferirCategoria(nascimento, "F", referencia, categoriasSemLivre, circuitoJovem);
    expect(categoria).toBeNull();
  });

  test("respeita o sexo do atleta ao escolher entre categorias do mesmo nome", () => {
    const nascimento = new Date("2008-01-01");
    const referencia = new Date("2026-01-01"); // idade 18
    const categoria = inferirCategoria(nascimento, "M", referencia, categorias, circuitoJovem);
    expect(categoria?.nome).toBe("Sênior");
  });

  test("não cruza categorias de circuitos diferentes mesmo com idade/sexo compatíveis", () => {
    // Duas categorias com o mesmo intervalo de idade/sexo, cada uma em um circuito.
    const categoriasComMaster: CategoriaRange[] = [
      ...categorias,
      { id: "6", nome: "SR", sexo: "M", idadeMin: 18, idadeMax: 99, circuitoId: circuitoMaster, autoClassificavel: true },
    ];
    const nascimento = new Date("2008-01-01");
    const referencia = new Date("2026-01-01"); // idade 18

    const categoriaJovem = inferirCategoria(nascimento, "M", referencia, categoriasComMaster, circuitoJovem);
    const categoriaMaster = inferirCategoria(nascimento, "M", referencia, categoriasComMaster, circuitoMaster);

    expect(categoriaJovem?.id).toBe("4");
    expect(categoriaMaster?.id).toBe("6");
  });

  test("ignora categorias marcadas como não auto-classificáveis (ex.: PCD, PRE)", () => {
    const categoriasComEspeciais: CategoriaRange[] = [
      { id: "7", nome: "PRE", sexo: "M", idadeMin: 0, idadeMax: 99, circuitoId: circuitoMaster, autoClassificavel: false },
      { id: "8", nome: "25+", sexo: "M", idadeMin: 25, idadeMax: 29, circuitoId: circuitoMaster, autoClassificavel: true },
    ];
    const nascimento = new Date("1998-01-01");
    const referencia = new Date("2026-01-01"); // idade 28 — cabe em ambas, mas PRE não é auto-classificável

    const categoria = inferirCategoria(nascimento, "M", referencia, categoriasComEspeciais, circuitoMaster);
    expect(categoria?.nome).toBe("25+");
  });
});
