import { z } from "zod";

export const clubeSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do clube."),
  sigla: z
    .string()
    .trim()
    .max(10, "Máximo de 10 caracteres.")
    .optional()
    .or(z.literal("")),
  cidade: z.string().trim().optional().or(z.literal("")),
});
export type ClubeInput = z.infer<typeof clubeSchema>;

export const circuitoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do circuito."),
  ordem: z.coerce.number("Ordem inválida.").int().default(0),
  ativo: z.coerce.boolean().default(true),
});
export type CircuitoInput = z.infer<typeof circuitoSchema>;

export const SEXO_CATEGORIA = ["M", "F", "MISTO"] as const;
export const categoriaSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe o nome da categoria."),
    sexo: z.enum(SEXO_CATEGORIA),
    idadeMin: z.coerce.number("Idade mínima inválida.").int().min(0),
    idadeMax: z.coerce.number("Idade máxima inválida.").int().min(0),
    circuitoId: z.string().min(1, "Selecione um circuito."),
    ordem: z.coerce.number("Ordem inválida.").int().default(0),
    autoClassificavel: z.coerce.boolean().default(true),
  })
  .refine((data) => data.idadeMax >= data.idadeMin, {
    message: "Idade máxima deve ser maior ou igual à idade mínima.",
    path: ["idadeMax"],
  });
export type CategoriaInput = z.infer<typeof categoriaSchema>;

export const METODO_PONTUACAO = ["COLOCACAO", "MANUAL"] as const;
export const tipoCompeticaoSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe o nome do tipo de competição."),
    circuitoId: z.string().min(1, "Selecione um circuito."),
    metodoPontuacao: z.enum(METODO_PONTUACAO),
    grupoRelatorio: z.string().trim().min(2, "Informe o grupo do relatório."),
    ordem: z.coerce.number("Ordem inválida.").int().default(0),
    regraPontuacaoId: z
      .string()
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .refine(
    (data) => data.metodoPontuacao !== "COLOCACAO" || !!data.regraPontuacaoId,
    {
      message: "Selecione a regra de pontuação para o método por colocação.",
      path: ["regraPontuacaoId"],
    },
  );
export type TipoCompeticaoInput = z.infer<typeof tipoCompeticaoSchema>;

export const ESTILO_PROVA = [
  "LIVRE",
  "COSTAS",
  "PEITO",
  "BORBOLETA",
  "MEDLEY",
] as const;
export const PISCINA = ["25m", "50m"] as const;
export const provaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da prova."),
  estilo: z.enum(ESTILO_PROVA),
  distancia: z.coerce
    .number("Distância inválida.")
    .int()
    .positive("Distância deve ser maior que zero."),
  piscina: z.enum(PISCINA),
});
export type ProvaInput = z.infer<typeof provaSchema>;

export const SEXO_ATLETA = ["M", "F"] as const;
export const atletaSchema = z.object({
  nomeCompleto: z.string().trim().min(3, "Informe o nome completo."),
  dataNascimento: z.coerce
    .date("Data de nascimento inválida.")
    .max(new Date(), "Data de nascimento não pode ser no futuro."),
  sexo: z.enum(SEXO_ATLETA),
  clubeId: z.string().min(1, "Selecione um clube."),
  ativo: z.coerce.boolean().default(true),
  numero: z.coerce
    .number("Número inválido.")
    .int()
    .positive("Número deve ser maior que zero.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
export type AtletaInput = z.infer<typeof atletaSchema>;

export const competicaoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da competição."),
  data: z.coerce.date("Data inválida."),
  local: z.string().trim().optional().or(z.literal("")),
  temporada: z.string().trim().optional().or(z.literal("")),
  tipoCompeticaoId: z.string().min(1, "Selecione o tipo de competição."),
});
export type CompeticaoInput = z.infer<typeof competicaoSchema>;
