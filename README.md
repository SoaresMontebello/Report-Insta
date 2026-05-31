# Report-Insta — SafeReport v2 (server)

SafeReport v2 é uma aplicação **ética** para organizar evidências e gerar texto de denúncia manual.

- ✅ Sem automação de denúncias
- ✅ Sem scraping
- ✅ Foco em organização, rastreabilidade e produtividade

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- shadcn/ui-style components (`components/ui`)
- NextAuth (Credentials)
- Prisma + PostgreSQL (Supabase Postgres via `DATABASE_URL`)
- Supabase Storage para anexos de imagem

## Funcionalidades

- `/login` e `/register`
- Rotas protegidas: `/casos/**`, `/api/casos/**`, `/api/upload`
- CRUD de casos por usuário
- Upload de anexos (PNG/JPEG/WEBP, até 5MB)
- Metadados dos anexos salvos no model `Anexo`
- URLs assinadas para visualização/download de anexos
- Templates por tipo de violação + copiar para clipboard
- Dashboard com estatísticas mínimas (total, por status, por tipo)

## Requisitos de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

Variáveis obrigatórias:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

> O app falha rapidamente se variáveis obrigatórias estiverem ausentes.

## Banco de dados (local com Docker)

```bash
docker compose up -d
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
```

## Rodando localmente

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Supabase Storage

1. Crie um bucket no Supabase (ex.: `safe-report-uploads`)
2. Defina o nome em `SUPABASE_STORAGE_BUCKET`
3. Defina `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor (nunca no cliente)

### Tradeoff de URLs assinadas

Anexos usam **signed URLs** para acesso temporário.

- Pró: mantém bucket privado
- Contra: URL expira; é necessário gerar nova URL para acesso futuro

## Scripts

- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run db:push`
