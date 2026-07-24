# Plano de Ajustes de UI/UX — Auditoria Impeccable

Este documento consolida todos os problemas encontrados pelas duas avaliações da skill `impeccable` (Audit técnico: 14/20 "Bom" · Critique de UX: 27/40 "Aceitável") num plano de correção único, coeso e ordenado por alavancagem (o que resolve mais coisas primeiro).

**Este arquivo é só o plano — nenhuma mudança foi aplicada ainda.** Cada item abaixo tem contexto suficiente (arquivo, causa raiz, solução concreta) para ser executado depois, um de cada vez ou em lote.

Reports completos ficam no histórico da conversa; aqui só o que precisa virar código.

---

## Fase A — Correções compartilhadas (maior alavancagem)

Estas três resolvem o maior número de problemas com a menor quantidade de mudança, porque tocam um ponto central usado em várias telas.

### A1. [P1] Bug de overflow de 77px no estado vazio — extrair `EmptyState` compartilhado

**Causa raiz**: o mesmo trecho está copiado e colado em 6 arquivos/9 ocorrências, sem `min-w-0` no filho de um flex container — o `<div className="flex items-center gap-2 ...">` não permite que o texto encolha abaixo da largura intrínseca, e a frase estoura a caixa em containers estreitos (confirmado pelo detector do browser: "overflows its box by 77px").

**Ocorrências a substituir**:
- `app/(app)/lancamento-pontos/page.tsx` (linhas ~94, 99)
- `app/(app)/resultados/page.tsx` (linhas ~110, 115, 120)
- `app/(app)/pontuacao/page.tsx` (linha ~80)
- `app/(app)/relatorio-matriz/matriz-table.tsx` (linha ~29)
- `app/(app)/ranking/ranking-individual-table.tsx` (linha ~19)
- `app/(app)/ranking/ranking-coletivo-table.tsx` (linha ~19)

**Solução**: criar `components/empty-state.tsx`:
```tsx
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-dashed p-6 text-muted-foreground">
      <span className="min-w-0">{children}</span>
    </div>
  );
}
```
Substituir as 9 ocorrências por `<EmptyState>Nenhum resultado encontrado para os filtros selecionados.</EmptyState>` (ou a mensagem específica de cada tela — algumas têm texto diferente, ex. "Selecione um circuito..."). Resolve o bug uma vez e elimina a duplicação — qualquer ajuste futuro (cor, ícone) vira um lugar só.

### A2. [P1] Ordenação de colunas implementada, mas nunca conectada

**Causa raiz**: `components/data-table.tsx` já configura `getSortedRowModel()` e o estado `sorting`, mas nenhum `TableHead` dispara `column.getToggleSortingHandler()`. É um recurso morto — sem afordance visual nenhuma.

**Solução**: em `components/data-table.tsx`, no `<TableHead>` do cabeçalho, quando `header.column.getCanSort()` for true:
```tsx
<TableHead
  key={header.id}
  onClick={header.column.getToggleSortingHandler()}
  className={header.column.getCanSort() ? "cursor-pointer select-none" : undefined}
>
  {flexRender(header.column.columnDef.header, header.getContext())}
  {{
    asc: <ChevronUp className="ml-1 inline size-3" />,
    desc: <ChevronDown className="ml-1 inline size-3" />,
  }[header.column.getIsSorted() as string] ?? null}
</TableHead>
```
Como é central no `DataTable` compartilhado, a correção vale para todas as 9+ telas CRUD de uma vez.

### A3. [P1] Campo `grupoRelatorio` é texto livre — pode quebrar o Relatório Matriz silenciosamente

**Causa raiz**: `app/(app)/tipos-competicao/tipo-competicao-form-dialog.tsx` (linha ~164-174) usa `<Input>` com apenas um placeholder de exemplo. `LABEL_GRUPO` em `matriz-table.tsx` só reconhece 6 chaves exatas em maiúsculas (`CONCURSO`, `CAMPEONATO`, `REGIONAL`, `BRASILEIRO_CATEGORIAS`, `BRASILEIRO_ABSOLUTO`, `FITA_AZUL`); qualquer variação de digitação/caixa cria um grupo novo, não rotulado, no relatório — o mesmo tipo de bug que a Fase 2 inteira existiu para resolver (nomes de clube digitados diferente).

**Solução**: trocar o `<Input>` por um `<NativeSelect>` com as 6 opções fixas (mesmo padrão já usado para `metodoPontuacao`, `sexo`, `circuitoId` no mesmo formulário):
```tsx
<NativeSelect id="grupoRelatorio" name="grupoRelatorio" defaultValue={tipo?.grupoRelatorio ?? ""} required>
  <option value="" disabled>Selecione um grupo</option>
  <option value="CONCURSO">Concurso</option>
  <option value="CAMPEONATO">Campeonato</option>
  <option value="REGIONAL">Regional</option>
  <option value="BRASILEIRO_CATEGORIAS">Brasileiro de Categorias</option>
  <option value="BRASILEIRO_ABSOLUTO">Brasileiro Absoluto</option>
  <option value="FITA_AZUL">Fita Azul</option>
</NativeSelect>
```
Extrair a lista de `LABEL_GRUPO` (hoje só em `matriz-table.tsx`) para um lugar compartilhado (ex. `lib/relatorio-matriz.ts`) para as duas telas lerem da mesma fonte, em vez de duplicar as 6 chaves.

---

## Fase B — Feedback de sucesso e de carregamento (P2)

### B1. Nenhuma confirmação de sucesso em criar/editar/excluir — usar `sonner`

**Causa raiz**: `hooks/use-close-on-success.ts` só fecha o diálogo; não existe toast/snackbar em nenhum lugar do projeto. `app/(app)/pontuacao/recalcular-button.tsx` é a única tela com algum feedback pós-ação (mensagem `role="status"` com contagem), e mesmo assim informal.

**Solução**: adotar `sonner` (componente de toast do próprio catálogo shadcn) como padrão único de feedback, em vez de estender o padrão `role="status"` caso a caso.

1. Instalar: `npx shadcn@latest add sonner` (gera `components/ui/sonner.tsx` já com suporte a tema claro/escuro via `next-themes` — reaproveita o `ThemeProvider` da Fase D).
2. Montar `<Toaster />` uma vez em `app/layout.tsx` (junto do `TooltipProvider`).
3. Em `hooks/use-close-on-success.ts`, ao fechar o diálogo com sucesso, disparar `toast.success(mensagem)`. Adicionar um `mensagemSucesso?: string` opcional ao contrato `ActionResult` (ex.: "Atleta salvo com sucesso.", "Clube excluído."), com uma mensagem padrão genérica quando a action não especificar uma.
4. Aplicar nos 9+ `*-form-dialog.tsx` e `*-delete-button.tsx`, e trocar o `role="status"` manual do `recalcular-button.tsx` pelo mesmo `toast.success` (ex.: `"${n} resultado(s) recalculado(s)."`), unificando os dois padrões que hoje coexistem.
5. Erros de action (`resultado.error`) também podem virar `toast.error(...)` além da mensagem inline já existente perto do campo — manter a inline (é mais específica/posicionada) e usar o toast só como reforço de que "algo não deu certo", não como única fonte do erro.

### B2. Nenhum estado de carregamento entre navegações — usar `Skeleton`

**Causa raiz**: todas as 14 páginas são Server Components assíncronos que buscam dados direto no `page.tsx`, sem nenhum arquivo `loading.tsx` por rota nem `<Suspense>` em lugar nenhum do app (`components/ui/skeleton.tsx` existe no catálogo shadcn, mas está sem uso). Ao navegar entre telas com mais dados (ex. Atletas, Resultados, Relatório Matriz), não há nenhuma pista visual de carregamento — a tela anterior congela até a próxima estar pronta.

**Solução**: usar o `Skeleton` já disponível (`components/ui/skeleton.tsx`) via os arquivos de convenção do Next App Router:
1. Criar um `loading.tsx` por diretório de rota em `app/(app)/*/` (ex. `app/(app)/atletas/loading.tsx`), cada um renderizando uma versão "esqueleto" da tela correspondente: título/descrição reais (não mudam) + placeholders `<Skeleton>` no lugar da tabela (algumas linhas de barras) e dos filtros, imitando a estrutura de cada tela.
2. Como o esqueleto de tabela se repete em quase toda tela (mesma forma do `DataTable`), extrair um `components/table-skeleton.tsx` reutilizável (parametrizado por número de colunas/linhas) para não duplicar em 9+ arquivos `loading.tsx`.
3. Telas com formato diferente (`/resultados`, `/lancamento-pontos`, `/relatorio-matriz`) podem reaproveitar o mesmo `TableSkeleton` como aproximação razoável, já que a estrutura visual (linhas + colunas) é semelhante o suficiente para servir de placeholder.
4. Next.js já mostra o `loading.tsx` automaticamente durante a navegação e o carregamento dos dados do Server Component da rota — não precisa de nenhum estado manual de `isLoading` no cliente.

---

## Fase C — Acessibilidade e i18n (P2/P3)

### C1. [P2] `aria-label` estático no filtro de coluna do `DataTable`

**Causa raiz**: `components/data-table.tsx`, o `NativeSelect` de cada filtro usa `aria-label={filter.placeholder}` (ex. "Todos os circuitos") como nome acessível fixo — não atualiza quando o usuário seleciona "Master". Leitor de tela sempre anuncia o placeholder, não o valor atual.

**Solução**: usar um `<Label>` visualmente oculto (`sr-only`) associado via `htmlFor`/`id` com o texto do filtro (ex. "Filtrar por Circuito"), deixando o `aria-label` dinâmico ou removendo-o em favor do label associado — o valor selecionado já é lido naturalmente pelo próprio `<select>`.

### C2. [P2] Textos de acessibilidade esquecidos em inglês

- `components/ui/dialog.tsx` (linha ~75): `<span className="sr-only">Close</span>` → `"Fechar"`. Aparece em todo diálogo do app (13+ usos).
- `components/ui/sidebar.tsx` (linha ~275): `<span className="sr-only">Toggle Sidebar</span>` → `"Alternar barra lateral"`. Aparece em todo header.
- (`components/ui/sheet.tsx` tem o mesmo "Close", mas o componente não é usado em lugar nenhum do app — pode corrigir por consistência ou ignorar já que é código morto.)

### C3. [P3] `<h1>` ausente na tela de login + título de página estático

**Causa raiz**: `app/(auth)/login/page.tsx` usa `CardTitle`, que renderiza `<div>` (`components/ui/card.tsx`), não um heading — a única tela do app sem nenhum landmark de heading. Além disso, `app/layout.tsx` define um único `metadata.title` ("Ranking FBDA") para as 14 rotas; a aba do navegador nunca muda, dificultando orientação com várias abas abertas.

**Solução**:
- Envolver o texto "Ranking de Natação" em `<CardTitle>` com um `<h1>` visualmente idêntico (ex. `<CardTitle render={<h1 />}>` se o componente aceitar, ou trocar por um `<h1>` estilizado manualmente só nesse caso).
- Adicionar `export const metadata` (ou `generateMetadata`) por rota nas 14 páginas, com título tipo `"Atletas — Ranking FBDA"`, `"Login — Ranking FBDA"`, etc. Pode ser um `Metadata` simples por `page.tsx`.

### C4. [P3] Botão de mostrar/ocultar senha sem `cursor-pointer`

**Causa raiz**: `components/login-form.tsx` tem um `<button type="button">` bruto (não passa pelo componente `Button`) — escapou da correção anterior de `cursor-pointer` porque aquela busca foi escopada só em `app/`, não em `components/`.

**Solução**: adicionar `cursor-pointer` à className do botão (linha ~45).

---

## Fase D — Dark mode: adicionar toggle (decisão do usuário)

**Situação atual**: `app/globals.css` tem um bloco `.dark { ... }` completo e com bom contraste (verificado: ≥6.4:1 em todos os pares), mas **nada no app aplica essa classe** — não há `next-themes`, nem leitura de `prefers-color-scheme`, nem toggle manual. É código morto em produção hoje.

**Decisão**: adicionar um toggle (não deixar como está).

**Solução recomendada**:
1. Instalar `next-themes` (padrão de mercado para Next.js App Router, evita flash-of-wrong-theme com um script inline no `<head>`).
2. Envolver `app/layout.tsx` com `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`.
3. Criar `components/theme-toggle.tsx` (botão com ícone sol/lua, usando `useTheme()` do `next-themes`) e adicionar no header do `app/(app)/layout.tsx`, ao lado do `UserMenu`.
4. Testar os três estados (light/dark/system) nas telas mais densas (`/relatorio-matriz`, `/resultados`) para confirmar que o contraste calculado se sustenta visualmente, não só no papel.

---

## Fase E — Responsividade (P3)

### E1. Tabelas CRUD sem tratamento em telas estreitas

**Causa raiz**: `components/ui/table.tsx` já tem `overflow-x-auto` no wrapper (`data-slot="table-container"`), mas sem nenhuma pista visual (sombra/gradiente) de que há mais conteúdo à direita — confirmado ao vivo em 375px: a coluna de ações (editar/excluir) fica fora da tela sem indicação.

**Solução**: adicionar uma sombra de scroll (gradient fade nas bordas esquerda/direita do container quando há overflow) — pode ser puro CSS com `background: linear-gradient(...)` posicionado como pseudo-elemento no wrapper de `Table`, ativado via `overflow-x: auto` + `scroll-timeline` ou uma solução mais simples com `onScroll` detectando `scrollLeft`/`scrollWidth`. Aplica-se a todas as tabelas de uma vez por estar no componente compartilhado.

---

## Fase F — Limpeza e polimento (P3)

### F1. Espaçamento entre botões de ação em tabelas CRUD
Botões `icon-sm` (28×28px) lado a lado com `gap-1` (4px) nas 9 telas CRUD — abaixo do padrão prático de 44×44px (acima do mínimo WCAG AA de 24×24, mas apertado). Como Editar e Excluir ficam adjacentes e Excluir é destrutivo, aumentar para `gap-2` (8px) no `<div className="flex justify-end gap-1">` repetido em cada `columns.tsx` reduz risco de clique errado. Baixo risco hoje porque o `AlertDialog` de confirmação já impede exclusão acidental — tratar como polimento, não correção urgente.

### F2. Barra de filtros do Ranking — agrupar visualmente
`app/(app)/ranking/filtros.tsx` renderiza 6 `NativeSelect` numa grade plana (Circuito, Escopo, Competição/Temporada, Categoria, Clube, Sexo) — excede o limite prático de ~4 opções simultâneas por ponto de decisão. Agrupar em dois blocos visuais: "Escopo" (Circuito + Completo/Provisório + Competição-ou-Temporada) e "Filtrar por" (Categoria + Clube + Sexo), com um separador ou rótulo de grupo entre eles.

### F3. Dependências mortas no `package.json`
- `react-hook-form` e `@hookform/resolvers`: nunca importados em nenhum arquivo (os formulários usam Server Actions nativas + `useActionState`). Remover.
- `shadcn`: está em `dependencies`, deveria estar em `devDependencies` (é só a CLI de scaffolding, não roda em produção).

### F4. Dashboard genérico (observação menor, sem prioridade definida)
`app/(app)/dashboard/page.tsx` é 4 cards de contagem estáticos, sem nada específico da federação nem clique para a seção correspondente. Não é um bug — é uma oportunidade de tornar a tela de entrada mais útil (ex.: cards clicáveis levando para `/atletas`, `/competicoes`, etc., ou destacar a próxima competição cadastrada). Fica em aberto até decidir se vale o esforço agora.

---

## Ajustes de UI (fora da auditoria)

Pedidos avulsos de UI, à parte dos achados das duas auditorias — mesma lógica de "planejar aqui antes de aplicar".

### G1. Atletas — trocar o input de data por um Date Picker (Calendar + Popover)

**Estado atual**: `app/(app)/atletas/atleta-form-dialog.tsx` (linha ~96) usa `<Input type="date">` nativo do navegador para "Data de nascimento" — aparência inconsistente entre navegadores/SO, sem calendário visual.

**Novo componente** (fornecido pelo usuário, do catálogo shadcn): combina `Calendar` + `Popover` + `InputGroup`/`Field`, com campo de texto editável manualmente (`onChange` faz parse com `new Date(...)`) e um botão de calendário ao lado que abre o `Popover` com o `Calendar`.

**Pré-requisitos — componentes ainda não existem neste projeto**:
- `components/ui/calendar.tsx`, `components/ui/popover.tsx`, `components/ui/field.tsx`, `components/ui/input-group.tsx` — nenhum dos quatro está no catálogo atual (`components/ui/` hoje tem só: button, card, input, label, separator, avatar, skeleton, sidebar, textarea, table, dialog, alert-dialog, select, dropdown-menu, sheet, tooltip, native-select).
- Instalar via CLI: `npx shadcn@latest add calendar popover field input-group` (o `calendar` traz `react-day-picker` como dependência nova).

**Risco a verificar antes de generalizar**: `Popover` é outro primitivo de posicionamento flutuante do Base UI, na mesma família do `Menu`/`Select` que já apresentaram bug de abertura nesta stack exata (Next 16 Turbopack + React 19.2 + `@base-ui/react` 1.6.0 — ver `docs/decisions.md`, Etapa 8, motivo pelo qual o projeto usa `NativeSelect` em vez do `Select` do catálogo). **Testar a abertura do `Popover` isoladamente antes de aplicar** — se ele também travar, o plano B é abrir o `Calendar` num `Dialog` (já comprovadamente estável no projeto) em vez de `Popover`.

**Integração com o formulário atual** (a diferença chave em relação ao código de exemplo do shadcn): o formulário de Atletas é HTML nativo (`<form action={formAction}>` + `FormData`, sem React Hook Form — ver Fase F3), então o `date`/`value` controlado por `useState` do componente de exemplo não chega à Server Action sozinho. Adicionar um `<input type="hidden" name="dataNascimento" value={date ? date.toISOString().slice(0, 10) : ""} />` ao lado do `InputGroupInput` visível, mantendo o `name` que `parseAtletaForm`/`atletaSchema` já esperam. O texto exibido no `InputGroupInput` deve usar formatação `pt-BR` (`date.toLocaleDateString("pt-BR", {...})`) em vez do `en-US` do exemplo, e o label "Subscription Date" vira "Data de nascimento" (reaproveitar o `<FieldLabel htmlFor="dataNascimento">` no lugar do `<Label>` atual).

**Escopo**: pedido é só para o módulo de Atletas (o único campo de data em formulário hoje é `dataNascimento`) — não mexer em `competicao-form-dialog.tsx` (campo `data` da competição) a menos que peça depois.

### G2. [Opcional] Migrar formulários para React Hook Form + Zod

**Motivação levantada pelo usuário**: os componentes do shadcn "performariam melhor" com RHF + Zod.

**Correção de premissa**: não é uma questão de performance de renderização — os componentes shadcn (`Input`, `Button`, etc.) são primitivos estilizados sem custo de render diferente com ou sem RHF. O motivo real é outro, mais estrutural: componentes shadcn **controlados por natureza** (`Calendar`, `Select` de verdade — não o `NativeSelect` — `Combobox`, `Switch`) não produzem valor de `FormData` sozinhos dentro de um `<form action={serverAction}>` nativo, porque não são `<input>`/`<select>` HTML de verdade. Hoje isso é contornado com `<input type="hidden">` (ver a integração do `G1`, por exemplo). O `Controller` do RHF resolve esse encaixe de forma nativa, sem gambiarra de hidden input — esse é o real ganho de "combina melhor com shadcn", não performance.

**Estado atual**: todos os 9+ formulários (`*-form-dialog.tsx`) usam `<form action={formAction}>` nativo + `useActionState` + `FormData`, com inputs não-controlados (`defaultValue`) e validação Zod só no servidor (dentro da própria Server Action, em `lib/validations.ts`). `react-hook-form` e `@hookform/resolvers` já estão no `package.json` (ver Fase F3) mas nunca foram importados em lugar nenhum.

**O que mudaria com a migração**:
- Cada formulário passaria a usar `useForm({ resolver: zodResolver(schema) })` com o **mesmo** schema Zod já existente em `lib/validations.ts` — reaproveitado, não duplicado.
- Ganho real: validação em tempo real por campo (borda vermelha/mensagem antes de submeter), e integração nativa (via `Controller`) com componentes controlados como o `Calendar` do `G1`, sem precisar do `<input type="hidden">`.
- Custo: cada input passa de `defaultValue` para `register("campo")`; a submissão deixa de ser um `<form action={serverAction}>` simples e passa a ser `handleSubmit(async (data) => await serverAction(data))` — toca todo formulário do app, não é uma mudança pontual.
- A validação server-side continuaria obrigatória de qualquer forma (nunca dá pra confiar só no cliente) — o ganho é estritamente de UX (erro aparece mais cedo) e de integração mais limpa com componentes controlados.

**Recomendação**: não migrar tudo de uma vez. Se for adiante, começar por 1-2 formulários onde o ganho é mais tangível — o de Atleta é um bom candidato justamente por já ir ganhar o `Calendar` controlado do `G1` — e sentir se compensa antes de generalizar pros outros 8 formulários.

**Dependência**: como já estão no `package.json`, não precisa reinstalar nada — só remover a nota de "dependência morta" da Fase F3 se essa migração for adiante.

---

## Ordem de execução sugerida

1. **Fase A** (A1 → A2 → A3) — maior alavancagem, menor esforço por resultado.
2. **Fase D** (dark mode toggle) — decisão já tomada; instalar `next-themes` antes da B1, já que o `sonner` reaproveita o mesmo `ThemeProvider`.
3. **Fase B** (B1 `sonner` → B2 `Skeleton`) — B1 depende do `ThemeProvider` da Fase D; B2 é independente e pode entrar em paralelo com qualquer fase.
4. **Fase C** (C1 → C2 → C3 → C4) — pequenas correções pontuais, rápidas.
5. **Fase E** (responsividade) — depende da Fase A estar pronta (o `EmptyState` já fica responsivo por tabela, mas as tabelas CRUD de dados reais precisam do próprio tratamento).
6. **Fase F** (limpeza) — pode ser feita a qualquer momento, inclusive em paralelo.
7. **Ajustes de UI (G)** — independentes do restante; podem entrar a qualquer momento, mas fazem sentido depois da Fase D (o `Popover` do date picker também deve respeitar o tema).