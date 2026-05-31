# SafeReport (MVP)

Aplicação web para **organização local** de evidências e geração de texto para denúncias manuais no Instagram (**sem automação de envio**).

## Stack

- Next.js (App Router) + TypeScript
- TailwindCSS
- Componentes estilo shadcn/ui em `components/ui`
- IndexedDB com Dexie.js (dados 100% no navegador)
- react-hook-form + zod para formulários e validação

## Funcionalidades MVP

- Cadastro de caso de denúncia:
  - username, URL de perfil, URLs de posts (lista)
  - tipo de violação
  - gravidade (1-5)
  - data de identificação
  - descrição curta e status
- Evidências:
  - upload de imagens com preview
  - armazenamento base64 no IndexedDB
  - notas internas
- Texto de denúncia:
  - botão **Gerar texto** por caso
  - templates por tipo de violação
  - copiar para área de transferência
- Lista de casos:
  - tabela
  - filtros (status, tipo, gravidade)
  - busca por username
  - paginação simples
- Detalhes do caso:
  - visualização completa
  - edição
  - exclusão com confirmação
  - marcar como denúncia enviada (com data)
  - observações pós-envio
- Dashboard:
  - total de casos
  - por status
  - por tipo
  - média de tempo entre criação e envio
  - casos recentes
- Exportação:
  - backup de todos os casos em JSON

## Estrutura principal

- `app/page.tsx` — dashboard
- `app/casos/page.tsx` — listagem
- `app/casos/novo/page.tsx` — criação
- `app/casos/[id]/page.tsx` — detalhes/edição
- `lib/db.ts` — Dexie/IndexedDB
- `lib/templates.ts` — templates de texto
- `types/index.ts` — tipos e labels
- `hooks/useCasos.ts` — CRUD local
- `components/*` — UI reutilizável

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Verificação

```bash
npm run lint
npm run build
```

## Segurança e escopo

- Não faz automação de denúncias
- Não faz scraping
- Não envia dados para backend no MVP
- Dados ficam apenas no navegador (IndexedDB local)
