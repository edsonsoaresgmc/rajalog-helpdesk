# Setup do ambiente — Bot Raja Log (Help Desk)

## 1. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:
- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase **rajalog-helpdesk**
  (`https://zedmlvjgfwxvnvqsssco.supabase.co`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: chave anon (pública) do mesmo projeto,
  em Project Settings → API.

Nunca use aqui as credenciais do Supabase do `gmc-portal-de-servicos` —
são projetos diferentes.

## 2. Aplicar a migration

No dashboard do Supabase do projeto **rajalog-helpdesk**, abra **SQL
Editor** e execute `supabase/migrations/00001_bot_fluxogramas.sql`.

Isso cria só as tabelas do editor de fluxogramas (`bot_fluxos`, `bot_nos`,
`bot_transicoes`). As tabelas operacionais do bot (`motoristas`,
`veiculos`, `documentos`, `conversas`, `mensagens`, `chamados`, `sessoes`)
vêm de `01_schema.sql`, que já deve estar aplicado neste projeto — esta
migration não recria nem altera essas tabelas.

## 3. Criar o primeiro administrador do bot

Este projeto não tem conceito de organização/perfil: qualquer conta
autenticada aqui é considerada administrador do bot. No dashboard,
**Authentication → Users → Add user → Create new user**:
- E-mail e senha de sua escolha (marque "Auto Confirm User").

Recomendado: em **Authentication → Providers → Email**, desative
cadastro público (self sign-up) — os administradores devem ser criados
manualmente pelo dashboard, nunca por uma tela de cadastro no app.

## 4. Rodar o app

```bash
npm install
npm run dev
```

Acesse http://localhost:3000 → redireciona para `/login` → entre com o
usuário criado → `/fluxogramas`.
