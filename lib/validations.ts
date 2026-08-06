import { z } from "zod";
import { GRUPOS_RELATORIO_VALORES } from "./relatorio-matriz";

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
  ordem: z.number("Ordem inválida.").int(),
  ativo: z.boolean(),
});
export type CircuitoInput = z.infer<typeof circuitoSchema>;

export const SEXO_CATEGORIA = ["M", "F", "MISTO"] as const;
export const categoriaSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe o nome da categoria."),
    sexo: z.enum(SEXO_CATEGORIA),
    idadeMin: z.number("Idade mínima inválida.").int().min(0),
    idadeMax: z.number("Idade máxima inválida.").int().min(0),
    circuitoId: z.string().min(1, "Selecione um circuito."),
    ordem: z.number("Ordem inválida.").int(),
    autoClassificavel: z.boolean(),
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
    grupoRelatorio: z.enum(GRUPOS_RELATORIO_VALORES, {
      error: "Selecione um grupo do relatório.",
    }),
    ordem: z.number("Ordem inválida.").int(),
    regraPontuacaoId: z
      .string()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    // Regra alternativa para competições fora de Salvador (Art. 15º, §2º do
    // Regulamento Geral 2026). Opcional — se vazia, regraPontuacaoId vale
    // para qualquer local.
    regraPontuacaoForaId: z
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
  distancia: z
    .number("Distância inválida.")
    .int()
    .positive("Distância deve ser maior que zero."),
  piscina: z.enum(PISCINA),
});
export type ProvaInput = z.infer<typeof provaSchema>;

export const SEXO_ATLETA = ["M", "F"] as const;
export const atletaSchema = z.object({
  nomeCompleto: z.string().trim().min(3, "Informe o nome completo."),
  dataNascimento: z
    .date("Data de nascimento inválida.")
    .max(new Date(), "Data de nascimento não pode ser no futuro."),
  sexo: z.enum(SEXO_ATLETA),
  clubeId: z.string().min(1, "Selecione um clube."),
  ativo: z.boolean(),
  numero: z
    .number("Número inválido.")
    .int()
    .positive("Número deve ser maior que zero.")
    .optional(),
});
export type AtletaInput = z.infer<typeof atletaSchema>;

export const LOCAL_TIPO = ["SALVADOR", "FORA"] as const;
export const competicaoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da competição."),
  data: z.date("Data inválida."),
  local: z.string().trim().optional().or(z.literal("")),
  localTipo: z.enum(LOCAL_TIPO),
  temporada: z.string().trim().optional().or(z.literal("")),
  tipoCompeticaoId: z.string().min(1, "Selecione o tipo de competição."),
});
export type CompeticaoInput = z.infer<typeof competicaoSchema>;

export const TIPO_REGRA = ["COLOCACAO", "FINA"] as const;
export const regraSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da regra."),
  tipo: z.enum(TIPO_REGRA),
});
export type RegraInput = z.infer<typeof regraSchema>;

// Bônus de recorde por circuito (Art. 15º §3º do Regulamento Geral /
// equivalente no Master) — mesmo raciocínio de posicoesFormSchema abaixo:
// validação por linha aqui, sem duplicatas entre linhas fica a cargo do
// servidor (constraint @@unique([circuitoId, tipoRecorde])).
export const pontuacaoRecordeItemSchema = z.object({
  tipoRecorde: z.string().trim().min(2, "Informe o tipo de recorde."),
  pontos: z.number("Pontos inválidos.").min(0, "Os pontos não podem ser negativos."),
});
export const recordesFormSchema = z.object({
  recordes: z.array(pontuacaoRecordeItemSchema),
});
export type RecordesFormInput = z.infer<typeof recordesFormSchema>;

// Validação por linha (posição/pontos individuais). Regras entre linhas
// (sem duplicatas, ao menos uma posição) continuam em
// lib/scoring.ts#validarPosicoes — é a mesma lógica já testada (TDD) e usada
// como segunda camada de validação no servidor; não duplicar aqui.
export const posicaoPontosSchema = z.object({
  posicao: z.number("Posição inválida.").int().min(1, "A posição deve ser maior ou igual a 1."),
  pontos: z.number("Pontos inválidos.").int().min(0, "Os pontos não podem ser negativos."),
});
export const posicoesFormSchema = z.object({
  posicoes: z.array(posicaoPontosSchema).min(1, "Adicione ao menos uma posição."),
});
export type PosicoesFormInput = z.infer<typeof posicoesFormSchema>;
