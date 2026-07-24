import path from "node:path";
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ColunaMatriz } from "@/lib/relatorio-matriz-query";
import type { MatrizLinha } from "@/lib/relatorio-matriz";

Font.register({
  family: "Rubik",
  src: path.join(process.cwd(), "public/fonts/Rubik-Variable.ttf"),
});

const CORES = {
  azul: "#114E8B",
  azulMedio: "#33477E",
  azulEscuro: "#00103B",
  cinzaTexto: "#4B4B4B",
  cinzaFundo: "#F3F4F6",
  branco: "#FFFFFF",
};

const LABEL_GRUPO: Record<string, string> = {
  CONCURSO: "Concursos",
  CAMPEONATO: "Campeonatos",
  REGIONAL: "Regionais",
  BRASILEIRO_CATEGORIAS: "Brasileiro de Categorias",
  BRASILEIRO_ABSOLUTO: "Brasileiro Absoluto",
  FITA_AZUL: "Fita Azul",
};

function labelGrupo(grupo: string) {
  return LABEL_GRUPO[grupo] ?? grupo;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Rubik",
    fontSize: 7,
    color: CORES.azulEscuro,
    paddingBottom: 32,
  },
  header: {
    backgroundColor: CORES.azul,
    color: CORES.branco,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  headerSigla: { fontSize: 10, letterSpacing: 2, marginBottom: 2 },
  headerTitulo: { fontSize: 15 },
  corpo: { paddingHorizontal: 24, paddingTop: 12 },
  tituloRelatorio: { fontSize: 12, marginBottom: 2 },
  subtitulo: { fontSize: 8, color: CORES.cinzaTexto, marginBottom: 1 },
  tabela: { marginTop: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  linhaHeader: {
    flexDirection: "row",
    backgroundColor: CORES.azulEscuro,
    color: CORES.branco,
    paddingVertical: 3,
  },
  linhaSubheader: {
    flexDirection: "row",
    backgroundColor: CORES.azulMedio,
    color: CORES.branco,
    paddingVertical: 2,
  },
  linhaCategoria: {
    backgroundColor: CORES.cinzaFundo,
    paddingVertical: 2,
    paddingHorizontal: 4,
    fontWeight: 700,
  },
  linha: {
    flexDirection: "row",
    paddingVertical: 2,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
  },
  grupoCol: { flexDirection: "row" },
  celAtleta: { width: "14%", paddingHorizontal: 3 },
  celClube: { width: "10%", paddingHorizontal: 3, color: CORES.cinzaTexto },
  celNum: { flex: 1, textAlign: "right", paddingHorizontal: 2 },
  celSubtotal: {
    flex: 1,
    textAlign: "right",
    paddingHorizontal: 2,
    fontWeight: 700,
  },
  celTotal: {
    width: "6%",
    textAlign: "right",
    paddingHorizontal: 3,
    fontWeight: 700,
  },
  rodape: {
    position: "absolute",
    bottom: 12,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: CORES.cinzaTexto,
  },
});

function Cabecalho({
  circuitoNome,
  sexo,
  temporada,
}: {
  circuitoNome: string;
  sexo: string;
  temporada?: string;
}) {
  const partes = [
    `Circuito: ${circuitoNome}`,
    `Sexo: ${sexo}`,
    temporada ? `Temporada: ${temporada}` : "Todas as temporadas",
  ];

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerSigla}>FBDA</Text>
        <Text style={styles.headerTitulo}>
          Federação Baiana de Desportos Aquáticos
        </Text>
      </View>
      <View style={styles.corpo}>
        <Text style={styles.tituloRelatorio}>
          Relatório Matriz — Atleta × Competição
        </Text>
        <Text style={styles.subtitulo}>{partes.join(" · ")}</Text>
        <Text style={styles.subtitulo}>
          Gerado em {new Date().toLocaleString("pt-BR")}
        </Text>
      </View>
    </>
  );
}

function Rodape() {
  return (
    <View style={styles.rodape} fixed>
      <Text>Sistema de Ranking FBDA</Text>
      <Text
        render={({ pageNumber, totalPages }) =>
          `Página ${pageNumber} de ${totalPages}`
        }
      />
    </View>
  );
}

export type FiltrosMatrizLabel = {
  circuitoNome: string;
  sexo: string;
  temporada?: string;
};

export function RelatorioMatrizPdf({
  colunas,
  grupos,
  linhas,
  filtros,
}: {
  colunas: ColunaMatriz[];
  grupos: string[];
  linhas: MatrizLinha[];
  filtros: FiltrosMatrizLabel;
}) {
  const colunasPorGrupo = grupos.map((grupo) => ({
    grupo,
    colunas: colunas.filter((c) => c.grupoRelatorio === grupo),
  }));

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Cabecalho
          circuitoNome={filtros.circuitoNome}
          sexo={filtros.sexo}
          temporada={filtros.temporada}
        />
        <View style={[styles.tabela, { marginHorizontal: 24 }]}>
          <View style={styles.linhaHeader}>
            <Text style={styles.celAtleta}>Atleta</Text>
            <Text style={styles.celClube}>Clube</Text>
            {colunasPorGrupo.map(({ grupo, colunas: colunasGrupo }) => (
              <Text
                key={grupo}
                style={{ flex: colunasGrupo.length + 1, textAlign: "center" }}
              >
                {labelGrupo(grupo)}
              </Text>
            ))}
            <Text style={styles.celTotal}>Total</Text>
          </View>
          <View style={styles.linhaSubheader}>
            <Text style={styles.celAtleta} />
            <Text style={styles.celClube} />
            {colunasPorGrupo.map(({ grupo, colunas: colunasGrupo }) => (
              <View
                key={grupo}
                style={[styles.grupoCol, { flex: colunasGrupo.length + 1 }]}
              >
                {colunasGrupo.map((coluna) => (
                  <Text key={coluna.id} style={styles.celNum}>
                    {coluna.nome}
                  </Text>
                ))}
                <Text style={styles.celSubtotal}>Subt.</Text>
              </View>
            ))}
            <Text style={styles.celTotal} />
          </View>

          {linhas.map((linha, index) => {
            const novaCategoria =
              linhas[index - 1]?.categoriaNome !== linha.categoriaNome;
            return (
              <View key={linha.atletaId}>
                {novaCategoria && (
                  <Text style={styles.linhaCategoria}>
                    {linha.categoriaNome}
                  </Text>
                )}
                <View style={styles.linha}>
                  <Text style={styles.celAtleta}>{linha.atletaNome}</Text>
                  <Text style={styles.celClube}>{linha.clubeNome}</Text>
                  {colunasPorGrupo.map(({ grupo, colunas: colunasGrupo }) => (
                    <View
                      key={grupo}
                      style={[
                        styles.grupoCol,
                        { flex: colunasGrupo.length + 1 },
                      ]}
                    >
                      {colunasGrupo.map((coluna) => (
                        <Text key={coluna.id} style={styles.celNum}>
                          {linha.pontosPorCompeticao[coluna.id] ?? "—"}
                        </Text>
                      ))}
                      <Text style={styles.celSubtotal}>
                        {linha.subtotaisPorGrupo[grupo] ?? 0}
                      </Text>
                    </View>
                  ))}
                  <Text style={styles.celTotal}>{linha.total}</Text>
                </View>
              </View>
            );
          })}

          {linhas.length === 0 && (
            <View style={styles.linha}>
              <Text>
                Nenhum resultado encontrado para os filtros selecionados.
              </Text>
            </View>
          )}
        </View>
        <Rodape />
      </Page>
    </Document>
  );
}

export function criarDocumentoRelatorioMatriz(props: {
  colunas: ColunaMatriz[];
  grupos: string[];
  linhas: MatrizLinha[];
  filtros: FiltrosMatrizLabel;
}) {
  return <RelatorioMatrizPdf {...props} />;
}
