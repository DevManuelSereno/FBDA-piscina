# Decisões do Projeto — Sistema de Ranking FBDA

Este documento é um registro vivo das decisões técnicas e de produto tomadas ao longo do projeto, com o *porquê* de cada uma. Serve para quem entrar no projeto depois (inclusive eu mesmo, em uma sessão futura) entender rapidamente por que as coisas são como são, sem precisar reconstruir o raciocínio.

Cada seção corresponde a uma etapa do plano de implementação (`~/.claude/plans/eu-tenho-que-fazer-giggly-noodle.md`). Novas decisões relevantes devem ser **anexadas** a este arquivo, não reescritas por cima.

---

## Contexto geral

A FBDA (Federação Baiana de Desportos Aquáticos) controlava atletas, resultados e ranking de competições de natação inteiramente em planilhas Excel — processo lento, propenso a erro de digitação e difícil de consolidar. O objetivo do projeto é substituir isso por um sistema web real, usado pela federação de fato (não um trabalho acadêmico).

**Decisões de produto fechadas antes do início do desenvolvimento:**
- Ferramenta real, não protótipo — vai para uso de produção.
- App web primeiro; exportação para desktop só se necessário no futuro (Tauri, documentado, não priorizado).
- Poucos usuários, com login — exige backend real, não é um site estático.
- MVP com pontuação por colocação; banco desenhado para permitir pontuação por tempo/FINA depois.
- Importação de planilhas Excel/CSV: fase posterior, não no MVP.
- Stack de UI definida pelo cliente do projeto (o desenvolvedor, não a FBDA): React + TypeScript + Tailwind + shadcn/ui.

---

## Stack e arquitetura

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | Next.js (App Router) | Login + hospedagem online exigem servidor; Next entrega backend (Server Actions/Route Handlers), auth e PDF server-side no mesmo projeto — sem precisar de um backend separado. |
| ORM / Banco | Prisma + SQLite (dev) / Postgres (prod, futuro) | Schema versionado; troca dev→prod é apenas trocar o datasource. |
| Auth | Auth.js (NextAuth v5), credenciais (email+senha) | Simples, poucos usuários, papéis ADMIN/EDITOR — não precisa de OAuth. |
| Tabelas/Grid | TanStack Table + React Hook Form + Zod | Grid de lançamento rápido com navegação por teclado; validação forte. |
| PDF | `@react-pdf/renderer` (server-side) | Documentos com identidade visual, gerados em Route Handlers. |
| Testes | Vitest | Unit em utilitários de pontuação/ranking/tempo/matriz. |

### Backend embutido no Next (decisão atual) → NestJS separado (só se necessário)

Toda a lógica de negócio fica em `lib/` framework-agnóstica (`lib/scoring.ts`, `lib/ranking.ts`, `lib/time.ts`, `lib/categoria.ts`, `lib/pontuacao-competicao.ts`, `lib/relatorio-matriz.ts`, etc.) — sem depender de APIs do Next. Server Actions e Route Handlers apenas chamam essas funções. Isso mantém a porta aberta para extrair uma API NestJS dedicada no futuro (gatilhos: app mobile consumindo a mesma API, jobs pesados em background, tempo real) sem reescrever regra de negócio — mas isso **não foi feito** e não é prioridade hoje.

### Modelagem de dados: `String`, não `enum` do Prisma

Campos de "tipo fixo" (sexo, estilo de prova, status do resultado, papel do usuário, tipo de regra, método de pontuação) são `String`, não `enum` nativo do Prisma. SQLite (usado em dev) não suporta enums nativos; mantendo `String` em todo lugar, o mesmo schema funciona sem alterações em dev e produção (Postgres). A validação do conjunto de valores válidos fica a cargo do Zod na camada de aplicação (`lib/validations.ts`).

### Identidade visual

Paleta e tipografia extraídas do site oficial da FBDA (fbda.com.br): azul primário `#114E8B`, dourado `#F9AF0D` (destaques/pódio), fonte Rubik. Aplicado via CSS variables do shadcn (tema claro e escuro).

---

## MVP (Etapas 0–8)

### Etapa 0 — Fundação
Scaffold Next.js + TS + Tailwind + shadcn init; tokens de cor FBDA + Rubik aplicados; Prisma apontando para SQLite dev.

### Etapa 1 — Modelo de dados & seed
Schema inicial (Clube, Categoria, Atleta, Prova, Competicao, Resultado, RegraPontuacao, PontuacaoPosicao, Usuario); `lib/time.ts` (centésimos de segundo ↔ `mm:ss.cc`, testado); seed com dados de exemplo.

**Decisão:** tempo armazenado como inteiro em centésimos de segundo, não float — evita erro de arredondamento.

### Etapa 2 — Autenticação & shell
Auth.js v5, tela `/login`, `proxy.ts` protegendo `(app)`.

**Decisão de framework:** Next.js 16 renomeou `middleware.ts` para `proxy.ts` (mesma assinatura). O wrapper `auth(...)` do Auth.js v5 é compatível com essa convenção.

**Achado de segurança (corrigido na Etapa 8):** o matcher do `proxy.ts` exclui `/api/*` inteiramente (`matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|svg|ico)$).*)"]`). Qualquer Route Handler sob `app/api/` **não é coberto** pela auth do proxy e precisa da própria checagem de sessão (`const session = await auth(); if (!session?.user) return new Response(..., {status: 401})`). Aplicado em todas as rotas de PDF.

### Etapa 3 — Cadastros base (CRUD)
CRUD de Clubes, Categorias, Provas, Atletas, Competições (Server Actions + Zod + TanStack Table).

**Padrão RSC/Client estabelecido:** `ColumnDef[]` com células JSX não pode atravessar Server→Client como prop direta ("Functions cannot be passed directly to Client Components"). Quando o `columns.tsx` não precisa de dados extras injetados, ele é um array estático `"use client"`. Quando precisa (ex.: lista de clubes para o seletor do formulário de edição), usa-se uma função fábrica `buildColumns({ ... })` chamada de dentro de um wrapper `"use client"` dedicado (ex.: `atletas-table.tsx`, `tipos-competicao-table.tsx`).

### Etapa 4 — Lançamento de resultados (núcleo)
Grid `/resultados` com navegação só por teclado (Tab/Enter avança célula, autosave no blur/Enter).

### Etapa 5 — Regras de pontuação & cálculo
`/pontuacao`, `lib/scoring.ts` (`calcularPontos`, `validarPosicoes`), botão "Recalcular".

### Etapa 6 — Ranking com filtros
`lib/ranking.ts` (`agregarRankingIndividual`, `agregarRankingColetivo`), `/ranking` com filtros e pódio.

**Decisão de algoritmo:** ranking "padrão de competição" — itens empatados recebem a mesma posição e a próxima pula o número de empatados (1, 1, 3, 4 — não 1, 1, 2, 3). Implementado como `atribuirPosicoes<T extends {pontos: number}>()`, genérico, assumindo entrada pré-ordenada decrescente.

### Etapa 7 — Exportação PDF
`app/api/pdf/ranking/route.ts` + `@react-pdf/renderer`.

**Convenção de arquivo:** Route Handlers devem ser `route.ts` (não `.tsx`), então a composição JSX do PDF mora em um `.tsx` separado (ex.: `ranking-pdf-document.tsx`) e é exposta ao `route.ts` via uma função fábrica plana (`criarDocumentoRanking(...)`, `criarDocumentoRelatorioMatriz(...)`).

**Fonte Rubik:** só existe como TTF variável upstream (sem arquivos estáticos por peso no repositório do Google Fonts). Baixada de `raw.githubusercontent.com/google/fonts/.../Rubik%5Bwght%5D.ttf`, registrada uma vez em `Font.register`.

### Etapa 8 — Verificação final & hardening
Revisão de código completa (skill `requesting-code-review`); correções aplicadas:
- `requireAuth()` (`lib/auth-guard.ts`) adicionado a **todas** as Server Actions — antes dependiam apenas do `proxy.ts` cobrir as páginas que as chamavam, um ponto único de falha frágil.
- `isUniqueConstraintError()` (`lib/prisma-errors.ts`) para distinguir violação de unicidade (P2002) de outros erros de banco.
- Validação de colocação inválida em `lib/resultado.ts`.
- Aviso não bloqueante de colocação duplicada na mesma prova (`temColocacaoDuplicada`) — colocações duplicadas às vezes são legítimas (empates), por isso é aviso, não bloqueio.
- `salvarResultado` passou a re-derivar a categoria no servidor em vez de confiar no valor vindo do cliente.

**Bugs de framework descobertos e contornados (Base UI 1.6.0 + Next 16 Turbopack + React 19.2):**
- `Menu` nunca abre via mousedown/click nesta combinação exata de versões — contornado evitando `DropdownMenu` (botões visíveis em vez de menu suspenso).
- `Dialog`/`AlertDialog` nunca completam a transição de fechamento (backdrop trava bloqueando cliques) mesmo com `animationDuration: 0s` — causa raiz é a máquina de estados de transição do próprio Base UI, não CSS. Corrigido montando o conteúdo condicionalmente (`{open && <DialogContent>...}`) em vez de deixar o Base UI gerenciar mount/unmount via seu ciclo de animação. Aplicado nos 13 usos de diálogo do projeto.
- `Button` do Base UI **não deve ser usado para links** via `render={<a/>}` — a biblioteca reserva esse primitivo para elementos com semântica de botão e emite warning quando o elemento renderizado é uma âncora (`nativeButton` espera um `<button>` nativo). Corrigido usando `<a>` estilizada diretamente com `buttonVariants(...)` (a função de classes CSS exportada de `components/ui/button.tsx`) em vez do componente `Button`, para os links de exportação de PDF.

---

## Fase 2 — Aderência ao fluxo real do cliente

### Contexto: análise das planilhas reais (`extras/`)

Após o MVP, o cliente enviou as planilhas que usa hoje + uma mensagem explicando a lógica de pontuação de clubes. A análise revelou que o modelo do MVP era simples demais para reproduzir o ranking real:

- **Múltiplos níveis de competição com escalas de pontos diferentes.** Concursos locais pontuam numa escala pequena (15, 13, 12...); campeonatos (Regional, Brasileiro de Categorias, Brasileiro Absoluto, Fita Azul) pontuam numa escala muito maior (90, 120, 168...) e aparentemente por tempo (colunas "IT" = Índice Técnico nas planilhas).
- **Dois circuitos independentes**: "Infantil a Sênior" e "Master", com esquemas de categoria distintos (INF1/INF2/JV1/JV2/J1/J2/SR vs. faixas etárias 25+/30+/.../75+) e calendários próprios — são planilhas separadas.
- **Erros de digitação de clube fragmentavam pontos** na planilha real (`NATAÇÃO REDE` / `NATAÇÃO/REDE` / `NATAÇÃO EM REDE` como três grafias do mesmo clube) — confirma que o cadastro canônico de `Clube` já resolve uma dor real.
- **Ranking coletivo = soma de todos os atletas do clube, M+F combinados**; o individual é separado por sexo. Confirmado numericamente: YACHT somava 226 pontos no arquivo de clubes = 151 (masculino) + 75 (feminino).
- O relatório que o cliente usa hoje é uma **matriz atleta × competição**, com subtotais por grupo de competição (Concursos / Campeonatos / Regionais / Brasileiro) e total geral.

**Decisões do cliente para a Fase 2:**
- Pontuação de campeonato: **entrada manual** de pontos por atleta/competição (fiel ao Excel de hoje). Cálculo automático por tempo/Índice Técnico fica como **futuro explícito** — a fórmula oficial não é conhecida, então não foi modelada nem estimada (evitar inventar regra de negócio sem confirmação do cliente).
- **Circuitos tratados como completamente separados** (não um ranking único filtrado).
- **Relatório matriz detalhado incluído** no escopo da Fase 2 (não adiado).

### Etapa 9 — Circuitos & categorias reais

- Novo model `Circuito` (nome, ordem, ativo). `Categoria` ganhou `circuitoId` + `ordem` + `autoClassificavel`. `Atleta` ganhou `numero` opcional (campo "N."/CODIGO da planilha).
- `inferirCategoria` (`lib/categoria.ts`) passou a receber apenas as categorias do circuito-alvo.
- Seed com os dois circuitos reais e suas classes:
  - **Infantil a Sênior**: nomes das classes (INF1, INF2, JV1, JV2, J1, J2, SR) vêm da planilha real. **Os cortes de idade são placeholder, ainda não confirmados pela FBDA** — a planilha não informa data de nascimento, só o nome da classe. Ajustar assim que o cliente informar os cortes oficiais.
  - **Master**: classes são faixas etárias explícitas na planilha real (25+, 30+, ..., 75+) — sem invenção. "PRE" (pré-master) e "PCD" (pessoa com deficiência) também existem no cadastro mas com `autoClassificavel=false`, pois não são faixas etárias e não devem ser atribuídas automaticamente por idade.

**Item em aberto:** confirmar com a FBDA os cortes de idade oficiais de cada classe do circuito Infantil a Sênior.

### Etapa 10 — Tipos de competição & pontuação por tipo

- Novo model `TipoCompeticao` (nome, circuito, `metodoPontuacao` "COLOCACAO"|"MANUAL", `regraPontuacaoId` opcional, `grupoRelatorio`, `ordem`). `Competicao` ganhou `tipoCompeticaoId` obrigatório.
- Nomes seedados são transcrição literal dos cabeçalhos das planilhas do cliente — nenhuma invenção: "Concurso"/"Campeonato"/"Regional"/"Brasileiro de Categorias"/"Brasileiro Absoluto" (Infantil a Sênior); "Concurso"/"Fita Azul"/"Campeonato" (Master). Só "Concurso" usa `COLOCACAO`; os demais são `MANUAL` até haver fórmula de cálculo por tempo confirmada.
- `/resultados` passou a restringir as competições ao circuito selecionado (só possível a partir desta etapa, via `tipoCompeticao.circuitoId`) e a esconder o grid de provas quando a competição é `MANUAL`, mostrando uma mensagem explicando que o lançamento manual chega na próxima etapa.
- `salvarResultado` e `recalcularRanking` passaram a resolver a regra de pontuação pelo `TipoCompeticao` da própria competição, **não mais por uma única regra "ativa" global** — cada tipo pode ter sua própria regra. O toggle "ativa" na tela `/pontuacao` continua existindo na UI mas não é mais o mecanismo de resolução real.

### Etapa 11 — Camada de pontuação por competição + lançamento manual

- Novo model `PontuacaoCompeticao`: rollup de **1 linha por atleta × competição** — fonte única do ranking e do relatório matriz. Campos: `categoriaId` (snapshot), `pontos`, `origem` ("CALCULADO"|"MANUAL"). `COLOCACAO` → derivada automaticamente da soma de `Resultado.pontos` daquele atleta na competição; `MANUAL` → digitada direto, sem `Resultado` nenhum por trás.
- `lib/pontuacao-competicao.ts` (TDD): `calcularPontosCompeticao` (soma pontos de resultados) e `parsePontosManual` (validação de entrada manual).
- `salvarResultado` e `recalcularRanking` passaram a derivar/reconstruir `PontuacaoCompeticao` automaticamente a cada salvamento ou recálculo.
- Nova tela `/lancamento-pontos`: grid de teclado (atleta × pontos) por circuito + competição, só lista competições `MANUAL`.
- `lib/ranking-query.ts` (`buscarRanking`) passou a ler de `PontuacaoCompeticao` em vez de `Resultado` diretamente — o ranking agora soma pontuação por colocação e manual automaticamente, sem lógica condicional na camada de consulta.

**Verificado:** lançamento por colocação (9 pts) + manual (84 pts) para a mesma atleta em competições diferentes do mesmo circuito somaram corretamente 93 pontos no ranking "completo" (por temporada).

### Etapa 12 — Relatório matriz (atleta × competição)

- `lib/relatorio-matriz.ts` (TDD): `montarMatriz` faz o pivot de `PontuacaoCompeticao` para linhas por atleta (agrupadas por categoria, na `ordem`) × colunas por competição (agrupadas por `grupoRelatorio`, na ordem do `TipoCompeticao`), com subtotal por grupo e total. `gruposOrdenados` extrai os grupos únicos na ordem de aparição das competições.
- Nova tela `/relatorio-matriz`: tabela HTML simples (não TanStack Table — cabeçalhos agrupados com `colSpan` não se encaixam bem no modelo de colunas do TanStack) com cabeçalho de dois níveis, scroll horizontal (o relatório é largo por natureza — a planilha original do cliente tem até 56 colunas).
- Exportação em PDF em paisagem, reaproveitando a identidade visual FBDA.

**Nota de lint:** o React Compiler (via `react-hooks/immutability`) proíbe reatribuir uma variável `let` durante o render, mesmo dentro de um `.map()` que retorna JSX (padrão comum para detectar "mudança de grupo" ao renderizar uma lista ordenada). A solução é comparar com o item anterior do próprio array por índice (`linhas[index - 1]?.categoriaNome !== linha.categoriaNome`) em vez de manter uma variável mutável capturada no closure.

---

## Itens em aberto / futuro (Etapa 13 — não iniciada)

- **Pontuação por tempo / Índice Técnico** (`metodoPontuacao="TEMPO"`, hipotético): só implementar quando o cliente fornecer as tabelas oficiais de IT/EF — a fórmula não é conhecida hoje e não deve ser adivinhada.
- **Confirmar cortes de idade oficiais** das classes do circuito Infantil a Sênior (hoje são placeholder no seed — ver Etapa 9).
- Importação das planilhas `extras/*.xlsx` (formato agregado atleta × competição) para carga histórica.
- Migração para Postgres + deploy em produção (hoje roda só em SQLite local).
- Possível extração de uma API NestJS dedicada (só se surgir necessidade real — ver seção "Backend embutido no Next").
- Refino de permissões (papéis ADMIN/EDITOR existem no modelo mas não são diferenciados na prática ainda).
