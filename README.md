# Report-Insta

MVP web para ajudar usuários a organizar evidências e redigir denúncias legítimas de conteúdo abusivo/ilegal no Instagram.

> **Aviso importante:** este app **não envia denúncias**, não automatiza ações e não interage com APIs do Instagram. Ele apenas organiza informações para uso no fluxo oficial da plataforma.

## Stack

- React
- Vite
- TypeScript
- Persistência local com `localStorage` (sem backend)

## Funcionalidades

- CRUD de casos
  - título
  - username do Instagram (sem `@`)
  - URL de perfil
  - URLs de posts
  - tipos de violação
  - envolve menor (`sim`, `não`, `não_sei`)
  - data/hora observada
  - observações
- Geração de texto de denúncia em PT-BR e EN
- Copiar texto para área de transferência
- Exportar um caso ou todos os casos para JSON
- Exportar CSV (caso único e todos os casos)
- Página estática “Como denunciar” com passo a passo

## Rodando localmente

```bash
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```
