import path from "node:path";
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { RankingColetivoItem, RankingIndividualItem } from "@/lib/ranking";

Font.register({
  family: "Rubik",
  src: path.join(process.cwd(), "public/fonts/Rubik-Variable.ttf"),
});

const CORES = {
  azul: "#114E8B",
  azulEscuro: "#00103B",
  dourado: "#F9AF0D",
  cinzaTexto: "#4B4B4B",
  cinzaFundo: "#F3F4F6",
  branco: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Rubik",
    fontSize: 10,
    color: CORES.azulEscuro,
    paddingBottom: 48,
  },
  header: {
    backgroundColor: CORES.azul,
    color: CORES.branco,
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  headerSigla: {
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 2,
  },
  headerTitulo: {
    fontSize: 20,
  },
  corpo: {
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  tituloRelatorio: {
    fontSize: 16,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 9,
    color: CORES.cinzaTexto,
    marginBottom: 2,
  },
  tabela: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
  },
  linhaHeader: {
    flexDirection: "row",
    backgroundColor: CORES.azulEscuro,
    color: CORES.branco,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  linha: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  linhaOuro: {
    backgroundColor: "#FDF3D9",
  },
  linhaPrata: {
    backgroundColor: CORES.cinzaFundo,
  },
  colPosicao: { width: 30 },
  colNome: { flex: 1 },
  colClube: { flex: 1, color: CORES.cinzaTexto },
  colPontos: { width: 50, textAlign: "right" },
  rodape: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: CORES.cinzaTexto,
  },
});

function corLinha(posicao: number) {
  if (posicao === 1) return styles.linhaOuro;
  if (posicao === 2 || posicao === 3) return styles.linhaPrata;
  return {};
}

export type FiltrosLabel = {
  escopo: string;
  categoriaNome?: string;
  clubeNome?: string;
  sexo?: string;
};

function Cabecalho({
  titulo,
  filtros,
}: {
  titulo: string;
  filtros: FiltrosLabel;
}) {
  const partesFiltro = [
    filtros.escopo,
    filtros.categoriaNome && `Categoria: ${filtros.categoriaNome}`,
    filtros.clubeNome && `Clube: ${filtros.clubeNome}`,
    filtros.sexo && `Sexo: ${filtros.sexo}`,
  ].filter(Boolean);

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerSigla}>FBDA</Text>
        <Text style={styles.headerTitulo}>
          Federação Baiana de Desportos Aquáticos
        </Text>
      </View>
      <View style={styles.corpo}>
        <Text style={styles.tituloRelatorio}>{titulo}</Text>
        <Text style={styles.subtitulo}>{partesFiltro.join(" · ")}</Text>
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

export function RankingIndividualPdf({
  itens,
  filtros,
}: {
  itens: RankingIndividualItem[];
  filtros: FiltrosLabel;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Cabecalho titulo="Ranking Individual" filtros={filtros} />
        <View style={[styles.tabela, { marginHorizontal: 32 }]}>
          <View style={styles.linhaHeader}>
            <Text style={styles.colPosicao}>#</Text>
            <Text style={styles.colNome}>Atleta</Text>
            <Text style={styles.colClube}>Clube</Text>
            <Text style={styles.colPontos}>Pontos</Text>
          </View>
          {itens.map((item, index) => (
            <View
              key={item.atletaId}
              style={[styles.linha, corLinha(index + 1)]}
            >
              <Text style={styles.colPosicao}>{index + 1}</Text>
              <Text style={styles.colNome}>{item.atletaNome}</Text>
              <Text style={styles.colClube}>{item.clubeNome}</Text>
              <Text style={styles.colPontos}>{item.pontos}</Text>
            </View>
          ))}
          {itens.length === 0 && (
            <View style={styles.linha}>
              <Text>Nenhum resultado encontrado para os filtros selecionados.</Text>
            </View>
          )}
        </View>
        <Rodape />
      </Page>
    </Document>
  );
}

export function criarDocumentoRanking(
  modo: "individual" | "coletivo",
  dados: {
    individual: RankingIndividualItem[];
    coletivo: RankingColetivoItem[];
  },
  filtros: FiltrosLabel,
) {
  if (modo === "coletivo") {
    return <RankingColetivoPdf itens={dados.coletivo} filtros={filtros} />;
  }
  return <RankingIndividualPdf itens={dados.individual} filtros={filtros} />;
}

export function RankingColetivoPdf({
  itens,
  filtros,
}: {
  itens: RankingColetivoItem[];
  filtros: FiltrosLabel;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Cabecalho titulo="Ranking Coletivo (por Clube)" filtros={filtros} />
        <View style={[styles.tabela, { marginHorizontal: 32 }]}>
          <View style={styles.linhaHeader}>
            <Text style={styles.colPosicao}>#</Text>
            <Text style={styles.colNome}>Clube</Text>
            <Text style={styles.colPontos}>Pontos</Text>
          </View>
          {itens.map((item, index) => (
            <View
              key={item.clubeId}
              style={[styles.linha, corLinha(index + 1)]}
            >
              <Text style={styles.colPosicao}>{index + 1}</Text>
              <Text style={styles.colNome}>{item.clubeNome}</Text>
              <Text style={styles.colPontos}>{item.pontos}</Text>
            </View>
          ))}
          {itens.length === 0 && (
            <View style={styles.linha}>
              <Text>Nenhum resultado encontrado para os filtros selecionados.</Text>
            </View>
          )}
        </View>
        <Rodape />
      </Page>
    </Document>
  );
}
