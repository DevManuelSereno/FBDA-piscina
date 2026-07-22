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

export const SEXO_CATEGORIA = ["M", "F", "MISTO"] as const;
export const categoriaSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe o nome da categoria."),
    sexo: z.enum(SEXO_CATEGORIA),
    idadeMin: z.coerce.number("Idade mínima inválida.").int().min(0),
    idadeMax: z.coerce.number("Idade máxima inválida.").int().min(0),
  })
  .refine((data) => data.idadeMax >= data.idadeMin, {
    message: "Idade máxima deve ser maior ou igual à idade mínima.",
    path: ["idadeMax"],
  });
export type CategoriaInput = z.infer<typeof categoriaSchema>;

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
});
export type AtletaInput = z.infer<typeof atletaSchema>;

export const competicaoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da competição."),
  data: z.coerce.date("Data inválida."),
  local: z.string().trim().optional().or(z.literal("")),
  temporada: z.string().trim().optional().or(z.literal("")),
});
export type CompeticaoInput = z.infer<typeof competicaoSchema>;
