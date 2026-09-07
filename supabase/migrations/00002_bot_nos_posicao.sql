-- =============================================================================
-- Migration 002 — Bot Raja Log: posição dos nós no canvas visual
-- =============================================================================

alter table bot_nos
  add column posicao jsonb not null default '{"x":0,"y":0}'::jsonb;
