# Bot Raja Log — Help Desk Motoristas

Painel administrativo para montar os fluxogramas de atendimento do bot
WhatsApp dos motoristas da Raja Log Transportes (Grupo Miranda Coelho).

Este repositório é **independente** do `gmc-portal-de-servicos` — tem seu
próprio projeto Supabase (`rajalog-helpdesk`), seu próprio banco e sua
própria autenticação. Não misture credenciais entre os dois projetos.

## O que este app faz

O administrador do bot cadastra aqui, nó a nó, os fluxos de conversa do
Help Desk: mensagens, menus de opção, perguntas abertas, condicionais,
abertura de chamado e encaminhamento para humano — com ramificações e
palavras-gatilho. O motor do bot (n8n + Evolution API) lê essas tabelas
para conduzir cada atendimento no WhatsApp.

Ver `PROJETO.md` (se presente) para o contexto completo do produto — os
7 módulos de atendimento, o schema operacional (motoristas, veículos,
documentos, conversas, chamados, sessões) e as decisões técnicas já
tomadas.

## Setup

Ver `SETUP.md`.
