export type CategoriaRange = {
  id: string;
  nome: string;
  sexo: string;
  idadeMin: number;
  idadeMax: number;
  circuitoId: string;
  // Categorias como PCD/PRE existem no cadastro mas não devem ser
  // atribuídas automaticamente por idade — só por override manual (futuro).
  autoClassificavel: boolean;
};

// Idade "completada no ano" — regra padrão de categorias de base no
// desporto aquático: conta pela diferença de anos-calendário, não pela
// data exata do aniversário em relação à competição.
export function calcularIdadeNoAno(
  dataNascimento: Date,
  dataReferencia: Date,
): number {
  return dataReferencia.getFullYear() - dataNascimento.getFullYear();
}

export function inferirCategoria(
  dataNascimento: Date,
  sexoAtleta: string,
  dataReferencia: Date,
  categorias: CategoriaRange[],
  circuitoId: string,
): CategoriaRange | null {
  const idade = calcularIdadeNoAno(dataNascimento, dataReferencia);
  const categoria = categorias.find(
    (c) =>
      c.circuitoId === circuitoId &&
      c.autoClassificavel &&
      idade >= c.idadeMin &&
      idade <= c.idadeMax &&
      (c.sexo === "MISTO" || c.sexo === sexoAtleta),
  );
  return categoria ?? null;
}
