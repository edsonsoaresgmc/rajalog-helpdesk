-- =============================================================================
-- Migration 004 — Cadastros: catálogos genéricos e extensíveis
--
-- Cobre Filiais, Tipos de Documento, Contatos e qualquer outro catálogo que
-- o admin queira criar depois, sem precisar de migration nova a cada um.
-- Motoristas e Veículos continuam nas tabelas próprias (01_schema.sql) —
-- são entidades estruturadas, não listas simples.
-- =============================================================================

create table cadastro_catalogos (
  id         uuid primary key default gen_random_uuid(),
  codigo     text not null unique check (codigo ~ '^[a-z][a-z0-9_]{1,39}$'),
  nome       text not null,
  descricao  text,
  icone      text,
  -- Definição dos campos extras de cada item deste catálogo:
  -- [{"chave": "telefone", "rotulo": "Telefone", "tipo": "texto"}]
  -- tipo ∈ {texto, numero, data, booleano}
  campos     jsonb not null default '[]'::jsonb,
  sistema    boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cadastro_itens (
  id          uuid primary key default gen_random_uuid(),
  catalogo_id uuid not null references cadastro_catalogos (id) on delete cascade,
  nome        text not null,
  -- Valores dos campos extras, conforme cadastro_catalogos.campos
  dados       jsonb not null default '{}'::jsonb,
  ativo       boolean not null default true,
  ordem       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_cadastro_itens_catalogo on cadastro_itens (catalogo_id, ordem);

create trigger trg_cadastro_catalogos_updated before update on cadastro_catalogos
  for each row execute function set_updated_at();
create trigger trg_cadastro_itens_updated before update on cadastro_itens
  for each row execute function set_updated_at();

alter table cadastro_catalogos enable row level security;
alter table cadastro_itens enable row level security;

create policy cadastro_catalogos_admin_all on cadastro_catalogos
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy cadastro_itens_admin_all on cadastro_itens
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- Catálogos padrão
-- ---------------------------------------------------------------------------
insert into cadastro_catalogos (codigo, nome, descricao, icone, campos, sistema) values
  ('filiais', 'Filiais', 'Bases/unidades da Raja Log', '🏢',
   '[{"chave":"cidade","rotulo":"Cidade","tipo":"texto"},{"chave":"uf","rotulo":"UF","tipo":"texto"}]'::jsonb,
   true),
  ('tipos_documento', 'Tipos de Documento', 'Tipos de documento de veículo (CRLV, ANTT, CIV...)', '📄',
   '[]'::jsonb, true),
  ('contatos', 'Contatos', 'Pessoas/setores notificados em chamados e urgências', '📇',
   '[{"chave":"telefone","rotulo":"Telefone","tipo":"texto"},{"chave":"email","rotulo":"E-mail","tipo":"texto"},{"chave":"setor","rotulo":"Setor","tipo":"texto"}]'::jsonb,
   true);

-- Popula Tipos de Documento com os valores já usados em /veiculos
insert into cadastro_itens (catalogo_id, nome, ordem)
select id, tipo, ordem
from cadastro_catalogos
cross join (values
  ('CRLV', 0), ('ANTT', 1), ('CIV', 2), ('Licenca_Operacional', 3),
  ('Licenca_Ambiental', 4), ('CTe', 5), ('MDFe', 6), ('Outro', 7)
) as t(tipo, ordem)
where cadastro_catalogos.codigo = 'tipos_documento';
