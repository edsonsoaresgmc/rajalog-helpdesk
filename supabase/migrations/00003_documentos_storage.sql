-- =============================================================================
-- Migration 003 — Storage para documentos de veículo (CRLV, ANTT, CIV, ...)
--
-- Bucket privado — arquivos só são lidos por administradores autenticados
-- (via este app) ou pelo motor do bot (n8n, com a service_role key, que
-- ignora RLS). Não altera as tabelas `veiculos`/`documentos` de 01_schema.sql.
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('documentos-veiculos', 'documentos-veiculos', false)
on conflict (id) do nothing;

create policy "documentos_veiculos_admin_all" on storage.objects
  for all
  using (bucket_id = 'documentos-veiculos' and auth.uid() is not null)
  with check (bucket_id = 'documentos-veiculos' and auth.uid() is not null);
