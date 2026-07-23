# Ranking FBDA — Sistema de Ranking de Natação

Sistema web para a Federação Baiana de Desportos Aquáticos (FBDA) gerenciar
clubes, atletas, competições, lançamento de resultados e o cálculo do
ranking geral — substituindo o preenchimento manual em planilhas Excel.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (estilo `base-nova`, sobre Base UI)
- **Prisma** + **SQLite** em dev (troque para Postgres em produção)
- **Auth.js v5** (NextAuth) — login por credenciais, sessão JWT
- **Vitest** para testes de unidade da lógica de negócio
- **@react-pdf/renderer** para exportação de ranking em PDF

## Pré-requisitos

- Node.js 20+
- npm

## Setup

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o arquivo de variáveis de ambiente e ajuste se necessário:

   ```bash
   cp .env.example .env
   ```

   Em produção, gere uma nova `AUTH_SECRET` com `openssl rand -base64 32`.

3. Crie o banco de dados e rode as migrations:

   ```bash
   npx prisma migrate dev
   ```

4. Popule o banco com dados de exemplo (clubes, categorias, provas,
   atletas, uma competição, regra de pontuação padrão e o usuário admin).
   **Este passo não roda automaticamente após o `migrate dev`/`reset` — é
   preciso rodar explicitamente:**

   ```bash
   npx prisma db seed
   ```

5. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

6. Acesse [http://localhost:3000](http://localhost:3000) e entre com o
   usuário criado pelo seed:

   - **Email:** `admin@fbda.local`
   - **Senha:** `piscina123`

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm start` | Roda o build de produção |
| `npm test` | Roda a suíte de testes (Vitest) uma vez |
| `npm run test:watch` | Testes em modo watch |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Checagem de tipos |
| `npx prisma studio` | Interface visual do banco de dados |

## Estrutura do projeto

```
app/
  (auth)/login/          # tela de login
  (app)/                 # área autenticada (protegida por proxy.ts)
    dashboard/
    clubes/ categorias/ provas/ atletas/ competicoes/   # cadastros (CRUD)
    resultados/           # lançamento de resultados (grid por teclado)
    pontuacao/            # regras de pontuação (posição → pontos)
    ranking/              # ranking individual/coletivo com filtros
  api/
    auth/[...nextauth]/   # Auth.js
    pdf/ranking/          # exportação de ranking em PDF
lib/                      # lógica de negócio (testada via Vitest)
  time.ts        # centésimos ↔ "mm:ss.cc"
  categoria.ts   # auto-classificação de categoria por idade
  resultado.ts   # parsing/validação de status+tempo+colocação
  scoring.ts     # cálculo de pontos por colocação
  ranking.ts     # agregação de ranking individual/coletivo
  ranking-query.ts  # filtro+agregação compartilhado entre tela e PDF
  db.ts          # cliente Prisma
prisma/
  schema.prisma  # modelo de dados
  seed.ts        # dados de exemplo
components/ui/   # componentes shadcn
```

## Papéis de usuário

`Usuario.papel` pode ser `ADMIN` ou `EDITOR`. O seed cria um usuário
`ADMIN`. Novos usuários precisam ser criados diretamente no banco (via
`prisma studio` ou um script) — não há tela de cadastro de usuários no
MVP atual.

## Notas de implementação

- **Tempo de prova** é armazenado em centésimos de segundo (inteiro) para
  evitar erro de ponto flutuante; a formatação `mm:ss.cc` fica em
  `lib/time.ts`.
- **Categoria do atleta** não é fixa: é calculada a partir da data de
  nascimento e da idade completada no ano da competição/consulta
  (`lib/categoria.ts`). Cada `Resultado` guarda um snapshot da categoria
  disputada, então o ranking permanece estável mesmo se as faixas etárias
  mudarem depois.
- **Pontuação** é calculada e gravada no momento do lançamento do
  resultado, usando a regra ativa no momento. Se a regra ativa mudar
  depois, use o botão **"Recalcular ranking"** em `/pontuacao` para
  reaplicar a nova regra a todos os resultados existentes.
- **Fonte Rubik no PDF**: só existe a versão variável do Rubik publicada
  pelo Google Fonts (sem pesos estáticos separados); o arquivo está em
  `public/fonts/Rubik-Variable.ttf` e é embutido pelo
  `@react-pdf/renderer`.
