-- =============================================================================
-- Migration 001 — Bot Raja Log: fluxogramas de atendimento (admin)
--
-- Projeto Supabase dedicado ("rajalog-helpdesk"), independente do Supabase
-- do portal GMC. As únicas contas neste projeto são as dos administradores
-- do bot (cadastradas manualmente em Authentication → Users) — não há
-- conceito de organização/perfil aqui, então "autenticado" já equivale a
-- "administrador do bot".
--
-- Esta migration cria só o cadastro dos fluxogramas (o que o admin monta:
-- mensagens, menus, perguntas, ramificações, abertura de chamado). As
-- tabelas operacionais do bot em si (motoristas, veiculos, documentos,
-- conversas, mensagens, chamados, sessoes) vêm de 01_schema.sql, já
-- aplicado neste projeto — não são recriadas aqui.
-- =============================================================================

create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create type fluxo_status as enum ('rascunho', 'publicado', 'arquivado');

create type bot_no_tipo as enum (
  'inicio',
  'mensagem',
  'menu_opcoes',
  'pergunta_aberta',
  'condicional',
  'abrir_chamado',
  'encaminhar_humano',
  'fim'
);

create table bot_fluxos (
  id                    uuid primary key default gen_random_uuid(),
  nome                  text not null,
  codigo                text not null unique check (codigo ~ '^[a-z][a-z0-9_]{1,39}$'),
  descricao             text,
  -- Palavras/expressões que disparam este fluxo fora do menu (cap. 6 do PROJETO.md)
  gatilho_palavras      text[] not null default '{}',
  -- Fluxos como Sinistro / SSMA com lesão interrompem qualquer outro fluxo em
  -- andamento (regra transversal, seção 7 do PROJETO.md)
  prioridade_seguranca  boolean not null default false,
  icone                 text,
  status                fluxo_status not null default 'rascunho',
  criado_por            uuid references auth.users (id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz
);

create table bot_nos (
  id                    uuid primary key default gen_random_uuid(),
  fluxo_id              uuid not null references bot_fluxos (id) on delete cascade,
  codigo                text not null,
  nome                  text not null,
  tipo                  bot_no_tipo not null,
  ordem                 integer not null default 0,
  -- Texto enviado ao motorista (mensagem, pergunta, confirmação de chamado...)
  mensagem              text,
  -- Opções apresentadas (menu_opcoes) ou valores testados (condicional):
  -- [{"valor": "colisao", "rotulo": "Colisão", "destino_codigo": "S02"}]
  opcoes                jsonb not null default '[]'::jsonb,
  -- Chave gravada/lida em sessoes.contexto_json — resposta livre (pergunta_aberta)
  -- ou campo testado (condicional)
  campo_contexto        text,
  -- Para abrir_chamado / encaminhar_humano
  setor_destino         text check (
    setor_destino is null
    or setor_destino in ('documentacao','fiscal','ssma','manutencao','financeiro','ti','outro')
  ),
  chamado_tipo          text,
  prioridade            text check (
    prioridade is null or prioridade in ('baixa','normal','alta','urgente')
  ),
  -- Ramificação padrão (menu_opcoes: resposta não reconhecida; condicional: senão)
  destino_padrao_codigo text,
  created_at            timestamptz not null default now(),
  unique (fluxo_id, codigo),
  check (
    tipo not in ('abrir_chamado','encaminhar_humano') or setor_destino is not null
  ),
  check (
    tipo not in ('pergunta_aberta','condicional') or campo_contexto is not null
  )
);

create table bot_transicoes (
  id               uuid primary key default gen_random_uuid(),
  fluxo_id         uuid not null references bot_fluxos (id) on delete cascade,
  origem_no_id     uuid not null references bot_nos (id) on delete cascade,
  destino_no_id    uuid not null references bot_nos (id) on delete cascade,
  -- {"opcao": "colisao"} para saída de menu_opcoes/condicional; null = padrão
  condicao         jsonb,
  created_at       timestamptz not null default now(),
  check (origem_no_id <> destino_no_id)
);

create index idx_bot_fluxos_status    on bot_fluxos (status);
create index idx_bot_nos_fluxo        on bot_nos (fluxo_id, ordem);
create index idx_bot_transicoes_fluxo on bot_transicoes (fluxo_id, origem_no_id);

create trigger trg_bot_fluxos_updated before update on bot_fluxos
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — qualquer usuário autenticado neste projeto é administrador do bot
-- (só existem contas de admin aqui; motoristas nunca logam neste app, eles
-- só conversam via WhatsApp/n8n, que acessa o banco por outra via).
-- ---------------------------------------------------------------------------
alter table bot_fluxos enable row level security;
alter table bot_nos enable row level security;
alter table bot_transicoes enable row level security;

create policy bot_fluxos_admin_all on bot_fluxos
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy bot_nos_admin_all on bot_nos
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy bot_transicoes_admin_all on bot_transicoes
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
