# Contexto do Projeto — Sistema de Ranking FBDA

> **Documento autossuficiente.** Consolida o plano original de implementação, o histórico completo de decisões (`docs/decisions.md`) e o plano de polimento de UI/UX (`docs/adjustments.md`) num único arquivo, para que nada se perca entre sessões mesmo que os outros três documentos não sejam consultados. Os arquivos originais continuam existindo e podem ter detalhe adicional pontual, mas este arquivo não depende deles.

---

# PARTE 1 — Visão geral e contexto de negócio

## O que é o projeto

A FBDA (Federação Baiana de Desportos Aquáticos) controlava atletas, resultados e ranking de competições de natação inteiramente em planilhas Excel — processo lento, propenso a erro de digitação e difícil de consolidar. O objetivo do projeto é substituir isso por um **sistema web real, usado pela federação de fato** (não um trabalho acadêmico), que:

- Cadastre **atletas** organizados por **categoria** (faixa etária/sexo) e **clube**.
- **Lance resultados de forma rápida** (a maior dor — hoje digitação manual em planilha).
- **Calcule o ranking geral automaticamente**, com pontuação configurável.
- Permita **filtrar** o ranking (categoria, clube, competição, sexo, período; provisório vs. completo).
- **Exporte rankings em PDF**, individual e coletivo, provisórios ou completos.

## Decisões de produto fechadas antes do início do desenvolvimento

- Ferramenta real, não protótipo — vai para uso de produção.
- App web primeiro; exportação para desktop só se necessário no futuro (Tauri v2 — o mesmo frontend React pode ser empacotado nele; documentado, não priorizado).
- Poucos usuários, com login — exige backend real, não é um site estático.
- MVP com pontuação por colocação; banco desenhado para permitir pontuação por tempo/FINA depois.
- Importação de planilhas Excel/CSV: fase posterior, não no MVP.
- Stack de UI definida pelo cliente do projeto (o desenvolvedor, não a FBDA): React + TypeScript + Tailwind + shadcn/ui.

## Identidade visual

Referência: site oficial da FBDA (fbda.com.br). Paleta e tipografia extraídas de lá:

| Papel | Hex | Uso |
|---|---|---|
| Azul primário | `#114E8B` | Header, sidebar, botões primários, links |
| Azul médio | `#165FAA` | Hover/estados, gráficos |
| Azul-marinho | `#00103B` / `#33477E` | Texto sobre claro, cabeçalhos, modo escuro |
| Dourado (accent) | `#F9AF0D` | Destaques, 1º lugar/medalha, badges |
| Ciano claro | `#72D2FF` / `#A6F4FF` | Fundos suaves, chips, realce "água" |
| Neutros | branco `#FFFFFF`, texto `#4B4B4B` | Fundos e texto padrão |

Fonte: **Rubik** (Google Fonts, via `next/font`) — mesma do site FBDA. Só existe como TTF variável upstream (sem arquivos estáticos por peso no repo do Google Fonts); para o PDF, baixada de `raw.githubusercontent.com/google/fonts/.../Rubik%5Bwght%5D.ttf` e registrada uma vez em `Font.register`. Aplicada via CSS variables do shadcn (tema claro e escuro). Sensação "aquática": azul dominante, dourado só para conquistas/pódio, cianos em realces sutis — evitar excesso de cor.

---

# PARTE 2 — Stack e arquitetura

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | Login + hospedagem online exigem servidor; Next entrega backend (Server Actions/Route Handlers), auth e PDF server-side no mesmo projeto — sem precisar de backend separado. |
| Linguagem | TypeScript | Definido pelo usuário. |
| Estilo | Tailwind CSS v4 | Definido pelo usuário. |
| Componentes | shadcn/ui | Definido pelo usuário como "Radix + Tailwind" no plano original — **mas o `shadcn init` real da Etapa 0 selecionou o style `base-nova`, que usa Base UI (`@base-ui/react`) em vez de Radix.** Isso não foi uma decisão consciente (ver PARTE 6, "O caso do date picker", pra entender as consequências). |
| ORM / Banco | Prisma 7 + SQLite (dev, via `@libsql/client`) / Postgres (prod, futuro) | Schema versionado; troca dev→prod é só trocar o datasource. |
| Auth | Auth.js v5 (NextAuth), credenciais email+senha | Simples, poucos usuários, papéis ADMIN/EDITOR — não precisa OAuth. |
| Tabelas/Grid | TanStack Table | Grid de lançamento rápido com navegação por teclado. |
| Formulários | **React Hook Form + Zod** | Ver etapa G2 na PARTE 6 — migração completa de todos os formulários, concluída. |
| PDF | `@react-pdf/renderer` (server-side) | Documentos com identidade visual, gerados em Route Handlers. |
| Toasts | `sonner` | Padrão único de feedback de sucesso/erro (Fase B). |
| Tema | `next-themes` | Dark mode com toggle (Fase D). |
| Testes | Vitest | Unit em utilitários de pontuação/ranking/tempo/matriz. |

**Versões-chave fixadas:** `next@16.2.11`, `react@19.2.4`, `react-dom@19.2.4`, `@base-ui/react@^1.6.0`. Essa combinação específica tem **bugs de framework confirmados** em componentes flutuantes — ver PARTE 5.

## Backend embutido no Next (decisão atual) → NestJS separado (só se necessário)

Toda a lógica de negócio fica em `lib/` **framework-agnóstica** (`lib/scoring.ts`, `lib/ranking.ts`, `lib/time.ts`, `lib/categoria.ts`, `lib/pontuacao-competicao.ts`, `lib/relatorio-matriz.ts`, etc.) — sem depender de APIs do Next. Server Actions e Route Handlers apenas chamam essas funções. Isso mantém a porta aberta para extrair uma API NestJS dedicada no futuro (gatilhos: app mobile consumindo a mesma API, jobs pesados em background, tempo real/WebSocket) sem reescrever regra de negócio — mas **não foi feito** e não é prioridade hoje.

## Modelagem de dados: `String`, não `enum` do Prisma

Campos de "tipo fixo" (sexo, estilo de prova, status do resultado, papel do usuário, tipo de regra, método de pontuação) são `String`, não `enum` nativo do Prisma. SQLite (dev) não suporta enums nativos; mantendo `String` em todo lugar, o mesmo schema funciona sem alterações em dev e produção (Postgres). A validação do conjunto de valores válidos fica a cargo do **Zod** na camada de aplicação (`lib/validations.ts`).

## Skills usadas durante o desenvolvimento (referência do plano original)

- `ui-ux-pro-max` / `frontend-design` — planejar/refinar cada tela.
- `impeccable` — auditoria de UX ao final de cada fase de UI (foi o gatilho de todo o ciclo de polimento na PARTE 6).
- `brainstorming`, `writing-plans`/`executing-plans`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `requesting-code-review` — disciplina de processo geral.

---

# PARTE 3 — Modelo de dados (Prisma)

12 models em `prisma/schema.prisma`: `Clube`, `Circuito`, `TipoCompeticao`, `Categoria`, `Atleta`, `Prova`, `Competicao`, `Resultado`, `PontuacaoCompeticao`, `RegraPontuacao`, `PontuacaoPosicao`, `Usuario`.

- **Clube**: `id, nome, sigla, cidade`.
- **Circuito** (Fase 2): `id, nome, ordem, ativo`. Ex.: "Infantil a Sênior", "Master". Cada circuito é um ranking **completamente separado** — não um filtro de um ranking único.
- **Categoria**: `id, nome, sexo (M/F/MISTO), idadeMin, idadeMax, circuitoId, ordem, autoClassificavel`. Usada para agrupar/auto-classificar atletas por idade, escopada por circuito.
- **Atleta**: `id, nomeCompleto, dataNascimento, sexo, clubeId, ativo, numero (opcional — coluna "N."/CODIGO da planilha do cliente)`. Categoria é derivada da idade na data da competição (`lib/categoria.ts#inferirCategoria`), escopada ao circuito-alvo.
- **Prova**: `id, nome, estilo (LIVRE/COSTAS/PEITO/BORBOLETA/MEDLEY), distancia, piscina (25m/50m)`.
- **TipoCompeticao** (Fase 2): `id, nome, circuitoId, metodoPontuacao ("COLOCACAO"|"MANUAL"), regraPontuacaoId? (opcional), grupoRelatorio ("CONCURSO"|"CAMPEONATO"|"REGIONAL"|"BRASILEIRO_CATEGORIAS"|"BRASILEIRO_ABSOLUTO"|"FITA_AZUL"), ordem`.
- **Competicao**: `id, nome, data, local, temporada, tipoCompeticaoId` (herda circuito e método via o tipo).
- **Resultado**: `id, atletaId, provaId, competicaoId, tempoCentesimos (nullable), colocacao (nullable), pontos (denormalizado), categoriaId (snapshot da categoria disputada), status (VALIDO/DQ/DNS)`.
- **PontuacaoCompeticao** (Fase 2 — rollup, fonte única do ranking e do relatório matriz): `id, atletaId, competicaoId, categoriaId (snapshot), pontos, origem ("CALCULADO"|"MANUAL")`, unique `(atletaId, competicaoId)`. `COLOCACAO` → derivada automaticamente da soma de `Resultado.pontos`; `MANUAL` → digitada direto, sem `Resultado` nenhum por trás.
- **RegraPontuacao**: `id, nome, tipo (COLOCACAO|FINA), ativo`.
- **PontuacaoPosicao** (para COLOCACAO): `regraId, posicao, pontos` (ex.: 1º→9, 2º→7...).
- **Usuario**: `id, email, senhaHash, nome, papel (ADMIN|EDITOR)` — papéis existem no schema mas **não são diferenciados na prática** ainda (item em aberto).

**Decisões de modelagem:**
- **Tempo** armazenado como inteiro em **centésimos de segundo**, nunca float — evita erro de arredondamento. Formatação `mm:ss.cc` via `lib/time.ts` (testado).
- **Pontos** calculados no lançamento a partir da regra e **armazenados** para consultas de ranking rápidas; botão "Recalcular" reaplica a regra quando ela muda.
- Ranking = agregação de `PontuacaoCompeticao` (não mais `Resultado` direto desde a Etapa 11) agrupada por atleta (individual) ou clube (coletivo). **Ranking coletivo = soma de todos os atletas do clube, M+F combinados**; individual é **separado por sexo** — confirmado numericamente com dado real do cliente (YACHT somava 226 pontos = 151 masculino + 75 feminino).
- Ranking "padrão de competição" para empates: itens empatados recebem a mesma posição e a próxima pula o número de empatados (1, 1, 3, 4 — não 1, 1, 2, 3). Implementado em `atribuirPosicoes<T extends {pontos: number}>()` (`lib/ranking.ts`), genérico, assume entrada pré-ordenada decrescente.

---

# PARTE 4 — Estrutura de pastas e convenções de código

```
app/
  (auth)/login/            # rota pública
  (app)/                   # tudo atrás de auth (proxy.ts)
    clubes/ circuitos/ categorias/ provas/ atletas/
    tipos-competicao/ competicoes/           # cadastros (CRUD)
    resultados/                              # grid de lançamento por colocação
    lancamento-pontos/                       # grid de lançamento manual (campeonatos)
    pontuacao/                               # regras de pontuação + recalcular
    ranking/                                 # ranking individual/coletivo + filtros
    relatorio-matriz/                        # relatório atleta × competição
    dashboard/
  api/pdf/                 # Route Handlers de exportação PDF
lib/                       # lógica de negócio framework-agnóstica
components/ui/              # componentes shadcn (style base-nova / Base UI)
prisma/schema.prisma        # schema + seed.ts
docs/decisions.md           # histórico de decisões técnicas (fonte original desta consolidação)
docs/adjustments.md          # plano de polimento de UI/UX (fonte original desta consolidação)
```

## Convenções estabelecidas ao longo do projeto

- **`ColumnDef[]` com células JSX não atravessa Server→Client como prop direta** ("Functions cannot be passed directly to Client Components"). Quando `columns.tsx` não precisa de dados extras, é um array estático `"use client"`. Quando precisa (ex.: lista de clubes pro seletor do formulário), usa-se uma função fábrica `buildColumns({ ... })` chamada de dentro de um wrapper `"use client"` dedicado (ex.: `atletas-table.tsx`).
- **Next.js 16 renomeou `middleware.ts` para `proxy.ts`** (mesma assinatura). O wrapper `auth(...)` do Auth.js v5 é compatível.
- **O matcher do `proxy.ts` exclui `/api/*` inteiramente** (`matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|svg|ico)$).*)"]`). Qualquer Route Handler sob `app/api/` **não é coberto** pela auth do proxy e precisa da própria checagem de sessão (`const session = await auth(); if (!session?.user) return new Response(..., {status: 401})`). Aplicado em todas as rotas de PDF.
- **`requireAuth()`** (`lib/auth-guard.ts`) em **todas** as Server Actions — não depender só do `proxy.ts` cobrir a página que as chama (ponto único de falha frágil).
- **`isUniqueConstraintError()`** (`lib/prisma-errors.ts`) distingue violação de unicidade (P2002) de outros erros de banco.
- **Route Handlers devem ser `route.ts`** (não `.tsx`) — a composição JSX do PDF mora num `.tsx` separado (ex.: `ranking-pdf-document.tsx`), exposta ao `route.ts` via função fábrica plana (`criarDocumentoRanking(...)`).
- **React Compiler (`react-hooks/immutability`) proíbe reatribuir `let` durante o render**, mesmo num `.map()` que retorna JSX (padrão comum pra detectar "mudança de grupo" numa lista ordenada). Solução: comparar com o item anterior do array por índice (`linhas[index - 1]?.categoriaNome !== linha.categoriaNome`) em vez de variável mutável no closure.

---

# PARTE 5 — Bugs de framework confirmados (Base UI 1.6.0 + Next 16 Turbopack + React 19.2)

Catalogados ao longo do projeto, todos na mesma família (componentes flutuantes/overlay do Base UI):

1. **`Menu` nunca abre** via mousedown/click nesta combinação exata de versões — contornado evitando `DropdownMenu` (botões visíveis em vez de menu suspenso).
2. **`Dialog`/`AlertDialog` nunca completam a transição de fechamento** (backdrop trava bloqueando cliques) mesmo com `animationDuration: 0s` — causa raiz é a máquina de estados de transição do próprio Base UI, não CSS. Corrigido montando o conteúdo condicionalmente (`{open && <DialogContent>...}`) em vez de deixar o Base UI gerenciar mount/unmount via seu ciclo de animação. Aplicado nos 13+ usos de diálogo do projeto.
3. **`Button` não deve ser usado para links** via `render={<a/>}` — a biblioteca reserva esse primitivo para elementos com semântica de botão e emite warning se o elemento renderizado é uma âncora. Corrigido usando `<a>` estilizada com `buttonVariants(...)` (função de classes exportada de `components/ui/button.tsx`) para os links de exportação de PDF.
4. **`Select` de verdade tem bug de abertura** — contornado usando `NativeSelect` (um `<select>` HTML puro estilizado) em vez do `Select` do catálogo shadcn, em todo o projeto.
5. **`Popover` — o mais recente e mais bem documentado, ver PARTE 6.** Causa raiz final: o projeto está no **style `base-nova`** do shadcn/ui, que usa Base UI como biblioteca de primitivos, em vez de Radix (o que a demo pública do shadcn usa). Um teste isolado com o código de exemplo exato do site do shadcn (Popover puro, sem nada específico deste projeto) reproduziu o mesmo bug — confirma que é do Base UI em si, não de algo que o projeto fez errado.

**Decisão em aberto resultante (ainda não iniciada):** refatoração completa dos componentes de `components/ui/` para trocar o style `base-nova` por um baseado em **Radix UI**, eliminando a causa raiz de todos os bugs acima de uma vez. É retrabalho não trivial: 19 componentes gerados no style atual, vários já com workarounds específicos do Base UI que precisarão ser reavaliados/removidos após a troca.

---

# PARTE 6 — Roadmap completo, etapa por etapa

## MVP (Etapas 0–8) — todas concluídas

### Etapa 0 — Fundação
Scaffold Next.js + TS + Tailwind; `shadcn init`; tokens de cor FBDA + Rubik aplicados; Prisma apontando para SQLite dev; estrutura de pastas.
**Checkpoint:** `npm run dev` sobe sem erro; página inicial exibe a paleta/fonte FBDA; `npx prisma migrate dev` cria o banco vazio.

### Etapa 1 — Modelo de dados & seed
Schema inicial (Clube, Categoria, Atleta, Prova, Competicao, Resultado, RegraPontuacao, PontuacaoPosicao, Usuario); `lib/time.ts` testado; `prisma/seed.ts` com dados de exemplo.
**Decisão:** tempo em centésimos de segundo, não float.
**Checkpoint:** `prisma migrate` + `seed` limpos; `prisma studio` mostra dados coerentes; testes de `time.ts` verdes.

### Etapa 2 — Autenticação & shell
Auth.js v5, tela `/login`, `proxy.ts` protegendo `(app)`, layout com sidebar/topbar (identidade FBDA), `/dashboard` placeholder.
**Achado de segurança (corrigido na Etapa 8):** ver PARTE 4, matcher do proxy exclui `/api/*`.
**Checkpoint:** login com usuário seed funciona; rota protegida redireciona sem sessão; navegação operante.

### Etapa 3 — Cadastros base (CRUD)
CRUD de Clubes, Categorias, Provas, Atletas, Competições (Server Actions + Zod + TanStack Table); helper de auto-classificação de categoria por idade.
**Checkpoint:** criar/editar/excluir cada entidade pela UI; atleta recebe categoria correta pela data de nascimento; validações Zod bloqueiam dados inválidos.

### Etapa 4 — Lançamento de resultados (núcleo, substitui o Excel)
`/resultados` — seleciona Competição + Prova → grid dos atletas com entrada **só por teclado** (Tab/Enter avança célula, autosave), parse/validação de tempo, colocação, status DQ/DNS.
**Checkpoint:** lançar uma prova inteira sem tocar no mouse; recarregar mantém tudo salvo; tempos inválidos rejeitados com feedback claro.

### Etapa 5 — Regras de pontuação & cálculo
`/pontuacao` (CRUD posição→pontos, ativar regra); `lib/scoring.ts` (`calcularPontos`, `validarPosicoes`, testado); botão "Recalcular".
**Checkpoint:** lançar resultados → pontos corretos gravados; trocar regra + "Recalcular" atualiza tudo; testes verdes.

### Etapa 6 — Ranking com filtros
`lib/ranking.ts` (`agregarRankingIndividual/Coletivo`, testado); `/ranking` com filtros (categoria, clube, competição, sexo, período, provisório vs. completo), ordenação, pódio (ouro/prata/bronze).
**Decisão de algoritmo:** ver PARTE 3, empates "padrão de competição".
**Checkpoint:** número bate com conferência manual do seed; filtros combinam; individual e coletivo corretos.

### Etapa 7 — Exportação PDF
`app/api/pdf/ranking/route.ts` + `@react-pdf/renderer`; individual/coletivo, provisório/completo.
**Convenções:** ver PARTE 4 (route.ts vs .tsx, fonte Rubik).
**Checkpoint:** baixar PDF de cada modo; conteúdo/ordem batem com a tela; layout legível e com a marca.

### Etapa 8 — Verificação final & hardening
Revisão de código completa (`requesting-code-review`); correções: `requireAuth()` em todas as Server Actions, `isUniqueConstraintError()`, validação de colocação inválida em `lib/resultado.ts`, aviso não-bloqueante de colocação duplicada (`temColocacaoDuplicada` — empates às vezes são legítimos), `salvarResultado` re-deriva categoria no servidor em vez de confiar no cliente. Também quando os 3 primeiros bugs de framework da PARTE 5 foram descobertos e contornados.

## Fase 2 — Aderência ao fluxo real do cliente (todas concluídas)

### Contexto: análise das planilhas reais (`extras/`)

Após o MVP, o cliente enviou as planilhas que usa hoje + explicação da lógica de pontuação de clubes. Descobertas:

- **Múltiplos níveis de competição com escalas de pontos diferentes.** Concursos locais pontuam pequeno (15,13,12...); campeonatos (Regional, Brasileiro de Categorias, Brasileiro Absoluto, Fita Azul) pontuam muito maior (90,120,168...), aparentemente por tempo (colunas "IT" = Índice Técnico). Uma única `RegraPontuacao` global era insuficiente.
- **Dois circuitos independentes**: "Infantil a Sênior" (INF1/INF2/JV1/JV2/J1/J2/SR) e "Master" (faixas etárias 25+/30+/.../75+) — planilhas separadas, calendários próprios.
- **Erros de digitação de clube fragmentavam pontos** na planilha real (`NATAÇÃO REDE` / `NATAÇÃO/REDE` / `NATAÇÃO EM REDE` como 3 grafias do mesmo clube) — confirma que o cadastro canônico de `Clube` resolve uma dor real.
- **Ranking coletivo = soma de todos os atletas do clube, M+F combinados**; individual separado por sexo (confirmado: YACHT 226 = 151 M + 75 F).
- Relatório do cliente é uma **matriz atleta × competição**, com subtotais por grupo (Concursos/Campeonatos/Regionais/Brasileiro) e total geral.

**Decisões do cliente para a Fase 2:**
- Pontuação de campeonato: **entrada manual** (fiel ao Excel). Cálculo automático por tempo/Índice Técnico é **futuro explícito** — fórmula oficial desconhecida, não modelada nem estimada.
- **Circuitos tratados como completamente separados**.
- **Relatório matriz detalhado incluído** no escopo.

### Etapa 9 — Circuitos & categorias reais
Novo model `Circuito`. `Categoria` ganhou `circuitoId`+`ordem`+`autoClassificavel`. `Atleta` ganhou `numero` opcional. `inferirCategoria` passou a receber só as categorias do circuito-alvo. Seed com os 2 circuitos reais:
- **Infantil a Sênior**: nomes das classes vêm da planilha real. **Cortes de idade são placeholder, ainda não confirmados pela FBDA** (item em aberto — a planilha não informa data de nascimento, só o nome da classe).
- **Master**: faixas etárias explícitas na planilha (25+ até 75+), sem invenção. "PRE" e "PCD" existem no cadastro com `autoClassificavel=false` (não são faixas etárias).
**Checkpoint:** cada circuito lista só suas classes; atleta classificado na classe correta.

### Etapa 10 — Tipos de competição & pontuação por tipo
Novo model `TipoCompeticao`. `Competicao` ganhou `tipoCompeticaoId` obrigatório. Nomes seedados são transcrição literal das planilhas — nenhuma invenção. Só "Concurso" usa `COLOCACAO`; os demais são `MANUAL` até haver fórmula por tempo confirmada. `/resultados` passou a restringir competições ao circuito selecionado e esconder o grid de provas quando `MANUAL`. `salvarResultado`/`recalcularRanking` passaram a resolver a regra pelo `TipoCompeticao` da competição, não mais por uma regra "ativa" global (o toggle "ativa" na UI de `/pontuacao` continua existindo mas não é mais o mecanismo real).
**Checkpoint:** criar concurso (COLOCACAO) e campeonato (MANUAL); lançamento respeita o método.

### Etapa 11 — Camada de pontuação por competição + lançamento manual
Novo model `PontuacaoCompeticao` (rollup). `lib/pontuacao-competicao.ts` (`calcularPontosCompeticao`, `parsePontosManual`, testado). `salvarResultado`/`recalcularRanking` derivam/reconstroem `PontuacaoCompeticao` automaticamente. Nova tela `/lancamento-pontos` (grid de teclado atleta×pontos, só competições `MANUAL`). `lib/ranking-query.ts#buscarRanking` passou a ler de `PontuacaoCompeticao`, não `Resultado` direto.
**Verificado:** lançamento por colocação (9pts) + manual (84pts) para a mesma atleta somaram corretamente 93 pontos no ranking "completo".

### Etapa 12 — Relatório matriz (atleta × competição)
`lib/relatorio-matriz.ts` (`montarMatriz`, testado) — pivot de `PontuacaoCompeticao`: linhas=atletas (agrupados por categoria, na `ordem`), colunas=competições (agrupadas por `grupoRelatorio`, na ordem do `TipoCompeticao`), com subtotal por grupo e total. Tela `/relatorio-matriz`: tabela HTML simples (não TanStack — cabeçalhos com `colSpan` não se encaixam no modelo de colunas), scroll horizontal (relatório real tem até 56 colunas). Exportação PDF em paisagem.

### Etapa 12.1 — Documentação de decisões
Criação de `docs/decisions.md` consolidando tudo (esta PARTE 6 é derivada dele).

## Verificação end-to-end (MVP + Fase 2)

1. `npm run dev`, login com usuário seed (`admin@fbda.local` / `piscina123`).
2. Criar Clube → Atleta (categoria auto pela idade) → Competição (com Tipo) → Prova → lançar resultado no grid → conferir pontos aplicados → `/ranking` (individual e coletivo, por circuito) com filtros → exportar PDF provisório e completo.
3. Validar grid de lançamento só por teclado.
4. Trocar regra de pontuação + "Recalcular", confirmar ranking atualizado.
5. Criar campeonato (MANUAL), lançar pontos em `/lancamento-pontos`.
6. Relatório matriz confere subtotais/total com planilha real do cliente.
7. `npx vitest run` (63 testes: `time.ts`, `scoring.ts`, `ranking.ts`, inferência por circuito, agregação do rollup, `relatorio-matriz.ts`); `npx tsc --noEmit`; `npm run lint`.

---

# PARTE 7 — Polimento de UI/UX (auditoria `impeccable`)

Gatilho: skill `impeccable` rodou **audit técnico (14/20 "Bom") e critique de UX (27/40 "Aceitável")**. Todos os achados viraram um plano único em `docs/adjustments.md`, executado em fases por alavancagem. **Todas as fases abaixo estão concluídas e commitadas**, exceto onde indicado.

## Fase A — Correções compartilhadas (maior alavancagem)

- **A1** — Bug de overflow de 77px no estado vazio (9 ocorrências em 6 arquivos, `<div className="flex items-center gap-2">` sem `min-w-0`). Extraído `components/empty-state.tsx` compartilhado.
- **A2** — Ordenação de colunas do TanStack Table estava configurada (`getSortedRowModel()`) mas nunca conectada na UI. Conectado em `components/data-table.tsx` (`onClick={header.column.getToggleSortingHandler()}` + ícones de seta).
- **A3** — Campo `grupoRelatorio` era texto livre (`<Input>`) e podia quebrar o Relatório Matriz silenciosamente por erro de digitação (o `LABEL_GRUPO` só reconhece 6 chaves exatas). Trocado por `<NativeSelect>` com as 6 opções fixas; lista extraída para `lib/relatorio-matriz.ts` compartilhado.

## Fase B — Feedback de sucesso e carregamento

- **B1** — Nenhuma confirmação de sucesso em criar/editar/excluir. Adotado `sonner` como padrão único: `<Toaster />` em `app/layout.tsx`, `mensagemSucesso?: string` opcional no `ActionResult`, aplicado em todos os `*-form-dialog.tsx`/`*-delete-button.tsx`. `recalcular-button.tsx` unificado pro mesmo padrão (era `role="status"` manual).
- **B2** — Nenhum estado de carregamento entre navegações. `loading.tsx` por rota em `app/(app)/*/`, reaproveitando `components/table-skeleton.tsx` (parametrizado por colunas/linhas).

## Fase C — Acessibilidade e i18n

- **C1** — `aria-label` estático nos filtros do `DataTable` (não atualizava com a seleção). Trocado por `<Label>` `sr-only` associado via `htmlFor`.
- **C2** — Textos esquecidos em inglês: `dialog.tsx` "Close"→"Fechar", `sidebar.tsx` "Toggle Sidebar"→"Alternar barra lateral".
- **C3** — `<h1>` ausente no login (usava `CardTitle`, que renderiza `<div>`) + `metadata.title` único pras 14 rotas. Corrigido com heading real + `export const metadata` por página.
- **C4** — Botão de mostrar/ocultar senha sem `cursor-pointer` (escapou da varredura original por estar em `components/`, não `app/`).

## Fase D — Dark mode (toggle)

`app/globals.css` já tinha um bloco `.dark {}` completo e com bom contraste (≥6.4:1) mas nada aplicava a classe. Decisão do usuário: **adicionar toggle**, não deixar como estava. Instalado `next-themes`, `ThemeProvider` em `app/layout.tsx`, `components/theme-toggle.tsx` no header.

## Fase E — Responsividade

Tabelas CRUD com `overflow-x-auto` mas sem indicação visual de mais conteúdo à direita (confirmado em 375px: coluna de ações fica fora da tela sem aviso). Adicionada sombra de scroll (gradient fade) no wrapper compartilhado de `Table`.

## Fase F — Limpeza e polimento

- **F1** — `gap-1` → `gap-2` entre botões de ação (Editar/Excluir) nas 9 telas CRUD.
- **F2** — Filtros do Ranking (6 `NativeSelect` numa grade plana) agrupados visualmente em "Escopo" e "Filtrar por".
- **F3** — Dependências mortas: `react-hook-form`/`@hookform/resolvers` removidos (nesse momento, antes do G2) por não estarem em uso. **`shadcn` NÃO foi movido para `devDependencies`** como o plano original sugeria — descoberta durante execução: `app/globals.css` importa `shadcn/tailwind.css`, consumido pelo Tailwind em build/runtime; mover quebra o build.
- **F4** — Dashboard genérico (4 cards estáticos) — observação menor, sem prioridade definida, não implementada.

## G1 — Date picker de Atletas (Calendar) — ver PARTE 8, saga completa do bug

Trocado `<Input type="date">` nativo por um componente de calendário visual no campo "Data de nascimento" de Atletas. Escopo: só Atletas (não mexeu no campo `data` de Competição). Passou por múltiplas iterações de bugfix documentadas na PARTE 8 — implementação final não usa nenhum overlay do Base UI.

## G2 — Migração para React Hook Form + Zod

Decisão do usuário: seguir com a migração mesmo sabendo que não era estritamente necessária (motivação original — "componentes shadcn performam melhor com RHF" — foi corrigida: não é performance, é que componentes controlados por natureza como `Calendar`/`Select` de verdade não produzem `FormData` sozinhos dentro de `<form action={serverAction}>` nativo; o `Controller` do RHF resolve isso sem gambiarra de `<input type="hidden">`).

**Escopo:** os 8 `*-form-dialog.tsx` (clube, circuito, categoria, prova, atleta, regra, tipo-competicao, competicao) + `posicoes-editor-dialog.tsx` (ganhou schema Zod novo, não tinha antes). Server Actions passaram a receber dado já tipado/validado pelo `zodResolver`, reaproveitando os schemas existentes em `lib/validations.ts`. `hooks/use-close-on-success.ts` foi removido (dependia de `useActionState`, que saiu de cena).

**Status:** concluído para os 8 formulários + posicoes-editor. Reintroduziu `react-hook-form`/`@hookform/resolvers` no `package.json` (removidos na F3, agora em uso de verdade).

---

# PARTE 8 — O caso do date picker de Atletas: saga completa

Este foi o fio condutor mais longo da sessão mais recente. Documentado em detalhe pra **não repetir tentativas já descartadas**.

**Sintoma original:** no formulário de editar/criar Atleta, campo "Data de nascimento" tem um botão de calendário (`Calendar` do shadcn, `captionLayout="dropdown"` — mostra `<select>` de mês e de ano em vez de só texto). Ao tentar abrir esse `<select>`, o popup fechava instantaneamente — em **cliques reais do navegador do usuário** (Opera), não em testes automatizados.

### Tentativas que NÃO resolveram (todas descartadas — não repetir)

1. **Ignorar `onOpenChange(false, {reason: "focus-out"})` no `Popover`.** Insuficiente: o motivo real varia por navegador (às vezes é `"outside-press"` no clique que confirma a opção).
2. **Verificar se o alvo do evento estava dentro de `[data-slot="calendar"]` antes de fechar** (com fallback pra `trigger`/`document.activeElement`). Funcionou em testes automatizados com `dispatchEvent` sintético — mas o usuário confirmou **por vídeo** que o bug persistia com cliques reais: o clique pra **abrir** o `<select>` já fechava o Popover instantaneamente, antes do dropdown nativo sequer aparecer. **Lição crítica: eventos sintéticos via `dispatchEvent` não reproduzem o caminho interno real do Base UI que decide "isso é clique fora" — validar só com JS dá falso positivo.**
3. **Trocar `Popover` por `Dialog`** (mesmo componente usado nos outros 13+ diálogos, comprovadamente estável para outros casos). O usuário reportou **por print** que o bug persistia idêntico — provou que a causa não era específica do `Popover`.
4. **Reconstruir o popup manualmente sem `transform` CSS** (centralização por flexbox em vez de `-translate-x-1/2 -translate-y-1/2`), na hipótese de que `<select>` nativo não abre de forma confiável dentro de um ancestral transformado (bug cross-browser conhecido, teoria plausível na hora). Confirmado via `getComputedStyle(...).transform === "none"` em toda a cadeia de ancestrais — mas o usuário reportou que **o bug persistia mesmo assim**.

### Causa raiz real

Um teste isolado com o **código de exemplo publicado na própria página do shadcn** (`Popover` puro, sem `Dialog` pai, sem transform algum) reproduziu o mesmo bug: o `<select>` de mês/ano fechava o popover instantaneamente ao tentar abrir. Isso eliminou definitivamente as hipóteses de transform/aninhamento e apontou para o **Base UI em si**.

**Por que o exemplo do site do shadcn funciona e o daqui não:** `components.json` deste projeto está configurado com `"style": "base-nova"` — um style do catálogo shadcn/ui que usa **Base UI** (`@base-ui/react`) como biblioteca de primitivos, em vez do **Radix UI** clássico (usado pelos styles "default"/"new-york" e pela demo pública do site shadcn). Essa escolha **não foi uma decisão consciente** — foi consequência indireta de rodar `shadcn init` pedindo só "shadcn/ui" na Etapa 0, sem reparar em qual style/biblioteca de primitivos ficou selecionado. O plano original até previa "shadcn/ui (Radix + Tailwind)" (ver PARTE 2) — a realidade divergiu do plano sem ninguém perceber até este bug.

### Fix aplicado (estado atual do código)

Removido **qualquer overlay do Base UI** do calendário de Atletas. Reconstruído em **React puro**:
- `app/(app)/atletas/atleta-form-dialog.tsx`, componente local `CalendarioDropdown`.
- `useState` para abrir/fechar.
- Um listener manual de `pointerdown` + `Escape` no `document` (fecha só se o clique for realmente fora do wrapper via `wrapRef.current?.contains(e.target)`).
- Zero dependência de heurística do Base UI para decidir quando fechar — por isso não sofre do mesmo bug.
- Também foi criada uma página de debug temporária (`app/(app)/debug-datepicker/`) para isolar a variável (testes com/sem `Dialog` pai, com/sem `captionLayout="dropdown"`, código exato do shadcn vs. código do projeto) — **essa página é só ferramenta de diagnóstico, não faz parte do produto, e deveria ser removida antes do commit final.**

### Decisão maior resultante (registrada, ainda NÃO iniciada)

**Próximo passo definido pelo usuário: refatoração completa dos componentes de `components/ui/` para trocar o style `base-nova` por um baseado em Radix UI.** Motivo: o Base UI é a causa raiz confirmada de múltiplos bugs de overlay já contornados individualmente neste projeto (`Menu`, `Dialog`/`AlertDialog`, `Popover`) — a solução estrutural elimina a necessidade de continuar caçando workarounds pontuais um por um. É retrabalho não trivial: 19 componentes gerados no style atual, vários já com correções específicas do Base UI que precisarão ser reavaliadas/removidas após a troca.

---

# PARTE 9 — Estado do git e próximos passos imediatos

## Não commitado no momento em que este arquivo foi escrito

```
 M app/(app)/atletas/atleta-form-dialog.tsx   # rewrite do date picker em React puro (PARTE 8)
 M docs/decisions.md                          # registro de toda a saga do date picker
?? app/(app)/debug-datepicker/                # página de teste TEMPORÁRIA — remover antes de commitar
?? context.md                                 # este arquivo
```

## Próxima sessão deveria

1. Decidir se remove `app/(app)/debug-datepicker/` (provavelmente sim — era só ferramenta de diagnóstico) e commitar o restante.
2. Rodar a suíte de verificação completa antes de commitar: `npx tsc --noEmit`, `npx vitest run`, `npm run lint`.
3. Confirmar com o usuário se testar o date picker novo (React puro) num navegador real resolveu de vez, antes de dar como encerrado.
4. Decidir quando encarar a migração `base-nova` → Radix (PARTE 5/8) — é a decisão estrutural maior em aberto.

## Itens em aberto conhecidos (fora do date picker)

- Cortes de idade oficiais do circuito "Infantil a Sênior" — placeholder no seed, pendente confirmação da FBDA (Etapa 9).
- Pontuação por tempo/Índice Técnico (`metodoPontuacao="TEMPO"`, hipotético): fórmula não fornecida pelo cliente, propositalmente não implementada/adivinhada.
- Importação das planilhas `extras/*.xlsx` (formato agregado atleta × competição) para carga histórica: não iniciada.
- Migração para Postgres + deploy em produção: não iniciada (hoje só SQLite local).
- Possível extração de API NestJS dedicada: só se surgir necessidade real (app mobile, jobs pesados, tempo real).
- Refino de permissões ADMIN/EDITOR: existem no schema, não diferenciadas na prática.
- F4 (dashboard menos genérico): observação sem prioridade definida.
- Migração `base-nova` → Radix (PARTE 5/8): decisão tomada, execução não iniciada.

---

# PARTE 10 — Convenções de trabalho e gotchas de ambiente

- **Commitar só quando pedido**, nunca por conta própria no meio do trabalho — mas o padrão do projeto até aqui foi commitar ao final de cada fase/etapa com mensagem descritiva em português, sem `--no-verify`, sem force-push.
- **Nunca confiar em teste automatizado com eventos sintéticos (`dispatchEvent`) para bugs de foco/clique em componentes flutuantes** — causou dois falsos positivos na saga do date picker (PARTE 8). Cliques reais do usuário disparam caminhos internos do Base UI que `dispatchEvent` não reproduz. Quando o usuário reportar que um fix "não resolveu", leve a sério mesmo que a mesma verificação automatizada "passe".
- **`docs/decisions.md` é o registro vivo** — sempre anexar, nunca reescrever por cima. Qualquer decisão técnica não-óbvia deveria ir lá.
- **`docs/adjustments.md`** é o plano de UI/UX — mudanças planejadas antes de aplicadas, executadas em fases.
- **Cuidado com processos de dev órfãos**: várias vezes um `node.exe` de uma execução anterior do `next dev` ficou preso na porta 3000, fora do controle da ferramenta de preview, servindo código desatualizado (levando a "bugs que não fazem sentido" porque na real era código velho). Se a ferramenta de preview disser que a porta 3000 já está em uso por um processo que não é o preview server, verificar com `Get-CimInstance Win32_Process -Filter 'ProcessId=X' | Select CommandLine` se é mesmo um `next dev` órfão deste projeto antes de matá-lo, depois subir de novo.
- **Ambiente de browser automatizado tem uma peculiaridade conhecida**: páginas com `loading.tsx` (streaming Suspense) às vezes ficam com o conteúdo real oculto porque `requestAnimationFrame` é pausado quando a aba não está "visível" para o compositor; contornado forçando `window.$RV(window.$RB)` via JS quando necessário — isso é só do ambiente de teste/automação, não afeta usuários reais.

## Como rodar

```bash
npm run dev          # Next dev server, porta 3000
npx tsc --noEmit      # type-check
npx vitest run        # testes (63 passando)
npm run lint          # ESLint
npx prisma studio     # inspecionar o banco
```

**Login de teste (seed):** `admin@fbda.local` / `piscina123`.

---

# PARTE 11 — Achados dos regulamentos oficiais 2026 (análise, planejamento pendente)

**Fonte:** dois PDFs adicionados pelo cliente em `extras/` — `REGULAMENTO GERAL DE COMPETIÇÕES 2026 CORRIGIDO 26.03.2026.pdf` (Concursos/Troféus/Campeonatos/Festivais/Copa, circuito "Infantil a Sênior" e classes mais jovens) e `Regulamento Concursos e Campeonatos Master 2026 - finalizado.pdf` (circuito Master). Lidos e analisados integralmente; **nenhuma mudança de código foi feita ainda** — esta seção é só o levantamento, para virar plano de implementação numa sessão futura.

## Confirmações do que já estava certo

- **Cálculo de idade "por ano civil"** (`lib/categoria.ts#calcularIdadeNoAno` — diferença de ano-calendário, não data exata) é exatamente o critério exigido pelo Regulamento Master (Art. 5º, §1º: idade em 31/12 do ano). Decisão de engenharia já tomada antes, agora respaldada por texto oficial — não precisa mudar.
- Classes do circuito "Infantil a Sênior" (INF1, INF2, JV1, JV2, J1, J2, SR) batem com o Regulamento Geral (Art. 2º, §2º).

## 🔴 Discrepância confirmada no seed do Master (`prisma/seed.ts`)

O Regulamento Master (Art. 5º) lista 16 classes por sexo, de Pré-Master a 95+. Comparado ao seed atual:

| Regulamento oficial | Seed atual (`prisma/seed.ts`, linhas ~82-98) |
|---|---|
| PRÉ-MASTER: **20 a 24 anos** | `PRE`: **18 a 24 anos** ❌ |
| 25+ até **95+** (16 classes, faixas de 5 anos, até 99) | Só vai até **75+** (banda `[25,30,...,75]`, última banda absorve 75-99 num grupo só) ❌ |

**Faltam as classes 80+, 85+, 90+ e 95+** — hoje qualquer atleta Master com 76+ anos é classificado genericamente como "75+". `PRE` também está com o piso errado.

## 🆕 Conceitos novos, ainda não modelados no schema

1. **Classes mais jovens** (Regulamento Geral, Art. 2º §1º): Pingo-Mirim, Mini-Mirim, Pré-Mirim, Mirim 1, Mirim 2, Petiz 1, Petiz 2 — não existem em nenhum circuito/categoria do schema atual. Não fica claro nos regulamentos se são um circuito próprio ou categorias adicionais dentro de "Infantil a Sênior" — **precisa confirmação da FBDA**.

2. **Pontuação por colocação varia por local da competição** (Regulamento Geral, Art. 15º, §1º/§2º): Concursos em Salvador usam uma escala (25,20,17,15,13,11,10,9,8,7,6,5,4,3,2,1 para 16 colocações); fora de Salvador usam outra (30,25,20,18,16,13,12,11,9,8,7,6,5,4,3,2). O schema hoje (`RegraPontuacao`/`PontuacaoPosicao`) não tem noção de "local" afetando a regra — um único `TipoCompeticao` aponta para uma única `RegraPontuacao`.

3. **Bônus de recorde somado à pontuação de colocação** — não modelado hoje:
   - Regulamento Geral: Recorde Baiano de Classe = 10, Recorde Baiano Absoluto = 20, Recorde Brasileiro Absoluto = 60, Recorde Sul-Americano Absoluto = 70.
   - Regulamento Master: Recorde Baiano = 10, Recorde Brasileiro = 25, Recorde Sul-Americano = 50, Recorde Mundial = 100.
   - Valores diferentes entre os dois regulamentos — não é a mesma tabela reaproveitada.

4. **Revezamento pontua em dobro** (ambos os regulamentos) — não verificado se o app já contempla resultados de revezamento em algum lugar (não encontrado nada em `Resultado`/`PontuacaoCompeticao` relacionado a equipes/revezamento durante esta análise).

5. **"Melhores do Ano"** (Regulamento Geral, Art. 28º/29º) — ranking de temporada inteira, separado do ranking por competição, com escalas de pontos próprias por categoria de competição:
   - Concursos: 5-4-3-2-1 (1º a 5º)
   - Campeonato Baiano/Troféu FBDA: 15-12-9-6-3
   - Regionais (Troféu Walter Junior e outros): 30-24-18-12-6
   - Nacionais CBI: 60-48-36-24-12
   - Nacionais Absoluto: 100-80-60-40-20
   - Mais bônus de recorde (Baiano=20, Brasileiro=50 nesse contexto específico).
   - **Feature nova** — `lib/ranking.ts` hoje não agrega por "tipo de competição ao longo da temporada" dessa forma.

6. **"Eficiência por clube"** (Regulamento Master, Art. 9º) — métrica com matemática diferente do ranking coletivo atual: **soma de pontos do clube ÷ quantidade de atletas inscritos** (média, não soma). O ranking coletivo hoje (`lib/ranking.ts`) só soma pontos de todos os atletas do clube.

7. **Limites de inscrição por atleta** (ex.: Master permite 2 provas individuais em Concurso, 4 em Campeonato com máx. 2/etapa; jovens têm limites parecidos por classe no Regulamento Geral, Art. 12º) — só seria relevante se uma tela de "inscrição prévia" for construída (hoje o app só lança resultado, não gerencia inscrição antes da competição).

## O que continua sem resposta

- **Índice Técnico**: ambos os regulamentos mencionam premiação por Índice Técnico, mas remetem a uma "tabela em vigor organizada pela Diretoria Técnica da CBDA" — tabela externa, não incluída em nenhum dos dois PDFs. A fórmula continua desconhecida; o gap já documentado (`metodoPontuacao="TEMPO"` não implementado) permanece sem solução.
- O PDF do Master tem trechos **destacados em amarelo e sem os valores preenchidos** (4º/5º lugar em Campeonatos, parte de "Eficiência por clube") — sinal de que o próprio documento oficial está incompleto/em rascunho nesses pontos específicos. Não assumir valores; confirmar com a FBDA antes de codificar.

## Decisões que precisam de confirmação da FBDA antes de implementar

Nenhum destes itens deve ser implementado apenas com base na leitura dos PDFs — todos envolvem mudança de schema ou feature nova, e merecem confirmação explícita do cliente antes:

1. Corrigir `PRE` (18→20 anos de piso) e adicionar as classes 80+/85+/90+/95+ no circuito Master.
2. Decidir onde entram as classes Pingo-Mirim a Petiz 2 (circuito novo? categorias em "Infantil a Sênior"?).
3. Se/como modelar pontuação dependente do local da competição (Salvador vs. fora).
4. Se/como modelar bônus de recorde.
5. Se "Melhores do Ano" e "Eficiência por clube" entram no escopo do projeto agora ou ficam para uma fase futura (são features novas, não ajustes).
