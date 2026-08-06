import { atribuirPosicoes } from "./ranking";

// Escalas de pontos por "nível" de competição (Regulamento Geral, Art. 29º).
// Índice 0 = 1º lugar ... índice 4 = 5º lugar; a partir do 6º não pontua.
export const NIVEL_MELHORES_DO_ANO = {
  CONCURSOS: [5, 4, 3, 2, 1],
  CAMPEONATO_TROFEU: [15, 12, 9, 6, 3],
  REGIONAIS: [30, 24, 18, 12, 6],
  NACIONAIS_CBI: [60, 48, 36, 24, 12],
  NACIONAIS_ABSOLUTO: [100, 80, 60, 40, 20],
} as const;

export type NivelMelhoresDoAno = keyof typeof NIVEL_MELHORES_DO_ANO;

// Mapeamento entre TipoCompeticao.grupoRelatorio (schema atual) e os níveis
// do Art. 29º — não é 1:1 (Regionais lista 7 troféus nominalmente distintos
// no regulamento), decisão registrada como pendente de confirmação da FBDA.
// FITA_AZUL não é citado no Art. 29º, então não pontua no Melhores do Ano.
export const GRUPO_PARA_NIVEL: Partial<Record<string, NivelMelhoresDoAno>> = {
  CONCURSO: "CONCURSOS",
  CAMPEONATO: "CAMPEONATO_TROFEU",
  REGIONAL: "REGIONAIS",
  BRASILEIRO_CATEGORIAS: "NACIONAIS_CBI",
  BRASILEIRO_ABSOLUTO: "NACIONAIS_ABSOLUTO",
};

// Bônus de recorde específico do contexto "Melhores do Ano" (Art. 29º) —
// escala própria, diferente do PontuacaoRecorde por circuito (Etapa 5).
// Só Baiano/Brasileiro são citados nesse artigo; Sul-Americano/Mundial não
// têm bônus definido aqui.
export function bonusRecordeMelhoresDoAno(recordeTipo: string | null): number {
  if (!recordeTipo) return 0;
  if (recordeTipo.startsWith("Baiano")) return 20;
  if (recordeTipo.startsWith("Brasileiro")) return 50;
  return 0;
}

export type ItemParaMelhoresDoAno = {
  competicaoId: string;
  categoriaId: string;
  atletaId: string;
  atletaNome: string;
  clubeId: string;
  clubeNome: string;
  // PontuacaoCompeticao.pontos — usado só para ranquear os atletas DENTRO
  // dessa competição+categoria (ver decisão registrada como pendente: não
  // existe colocação individual registrada para competições MANUAL).
  pontosCompeticao: number;
  grupoRelatorio: string;
  // Soma dos bônus de recorde (bonusRecordeMelhoresDoAno) dos resultados do
  // atleta nessa competição — somado independente da colocação no nível.
  bonusRecorde: number;
};

export type MelhoresDoAnoIndividualItem = {
  posicao: number;
  atletaId: string;
  atletaNome: string;
  clubeNome: string;
  pontos: number;
};

export type MelhoresDoAnoColetivoItem = {
  posicao: number;
  clubeId: string;
  clubeNome: string;
  pontos: number;
};

export function calcularMelhoresDoAno(itens: ItemParaMelhoresDoAno[]): {
  individual: MelhoresDoAnoIndividualItem[];
  coletivo: MelhoresDoAnoColetivoItem[];
} {
  const porCompeticaoCategoria = new Map<string, ItemParaMelhoresDoAno[]>();
  for (const item of itens) {
    const chave = `${item.competicaoId}:${item.categoriaId}`;
    const grupo = porCompeticaoCategoria.get(chave);
    if (grupo) {
      grupo.push(item);
    } else {
      porCompeticaoCategoria.set(chave, [item]);
    }
  }

  const atletas = new Map<
    string,
    { atletaNome: string; clubeId: string; clubeNome: string; pontos: number }
  >();

  for (const grupo of porCompeticaoCategoria.values()) {
    const nivel = GRUPO_PARA_NIVEL[grupo[0].grupoRelatorio];
    const escala = nivel ? NIVEL_MELHORES_DO_ANO[nivel] : null;

    const ordenado = [...grupo].sort(
      (a, b) => b.pontosCompeticao - a.pontosCompeticao,
    );
    const comPosicao = atribuirPosicoes(
      ordenado.map((item) => ({ ...item, pontos: item.pontosCompeticao })),
    );

    for (const item of comPosicao) {
      const pontosNivel =
        escala && item.posicao <= escala.length ? escala[item.posicao - 1] : 0;
      const pontosFinal = pontosNivel + item.bonusRecorde;

      const atual = atletas.get(item.atletaId);
      if (atual) {
        atual.pontos += pontosFinal;
      } else {
        atletas.set(item.atletaId, {
          atletaNome: item.atletaNome,
          clubeId: item.clubeId,
          clubeNome: item.clubeNome,
          pontos: pontosFinal,
        });
      }
    }
  }

  const clubes = new Map<string, { clubeNome: string; pontos: number }>();
  for (const atleta of atletas.values()) {
    const atual = clubes.get(atleta.clubeId);
    if (atual) {
      atual.pontos += atleta.pontos;
    } else {
      clubes.set(atleta.clubeId, {
        clubeNome: atleta.clubeNome,
        pontos: atleta.pontos,
      });
    }
  }

  const individualOrdenado = [...atletas.entries()]
    .map(([atletaId, item]) => ({
      atletaId,
      atletaNome: item.atletaNome,
      clubeNome: item.clubeNome,
      pontos: item.pontos,
    }))
    .sort((a, b) => b.pontos - a.pontos);

  const coletivoOrdenado = [...clubes.entries()]
    .map(([clubeId, item]) => ({ clubeId, ...item }))
    .sort((a, b) => b.pontos - a.pontos);

  return {
    individual: atribuirPosicoes(individualOrdenado),
    coletivo: atribuirPosicoes(coletivoOrdenado),
  };
}
