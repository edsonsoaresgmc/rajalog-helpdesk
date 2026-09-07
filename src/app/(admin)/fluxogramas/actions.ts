"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type CriarFluxoState = { error: string | null };

export async function criarFluxo(
  _prev: CriarFluxoState,
  formData: FormData
): Promise<CriarFluxoState> {
  const user = await requireAdmin();

  const nome = String(formData.get("nome") ?? "").trim();
  const codigo = String(formData.get("codigo") ?? "").trim().toLowerCase();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const icone = String(formData.get("icone") ?? "").trim() || "🚛";
  const gatilhos = String(formData.get("gatilho_palavras") ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const prioridade_seguranca = formData.get("prioridade_seguranca") === "on";

  if (!nome) return { error: "Informe o nome." };
  if (!/^[a-z][a-z0-9_]{1,39}$/.test(codigo))
    return {
      error:
        "Código deve começar com letra minúscula e usar apenas letras, números e underline (ex.: sinistro, checklist_veiculo).",
    };

  const supabase = await createClient();
  const { data: fluxo, error } = await supabase
    .from("bot_fluxos")
    .insert({
      nome,
      codigo,
      descricao: descricao || null,
      icone,
      gatilho_palavras: gatilhos,
      prioridade_seguranca,
      status: "rascunho",
      criado_por: user.id,
    })
    .select("id")
    .single();

  if (error || !fluxo) {
    return {
      error: error?.message.includes("duplicate")
        ? "Já existe um fluxo com esse nome ou código."
        : (error?.message ?? "Erro ao criar."),
    };
  }

  await supabase.from("bot_nos").insert([
    {
      fluxo_id: fluxo.id,
      codigo: "inicio",
      nome: "Início",
      tipo: "inicio",
      ordem: 0,
    },
    {
      fluxo_id: fluxo.id,
      codigo: "fim",
      nome: "Fim do fluxo",
      tipo: "fim",
      ordem: 1,
    },
  ]);

  revalidatePath("/fluxogramas");
  redirect(`/fluxogramas/${fluxo.id}`);
}

export async function excluirFluxo(
  fluxoId: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("bot_fluxos")
    .update({ deleted_at: new Date().toISOString(), status: "arquivado" })
    .eq("id", fluxoId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/fluxogramas");
  return { ok: true };
}

export async function publicarFluxo(
  fluxoId: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: nos } = await supabase
    .from("bot_nos")
    .select("tipo")
    .eq("fluxo_id", fluxoId);
  if (!nos?.some((n) => n.tipo === "inicio"))
    return { ok: false, error: "O fluxo precisa de um nó de início." };
  if (!nos?.some((n) => n.tipo === "fim"))
    return { ok: false, error: "O fluxo precisa de ao menos um nó de fim." };

  const { error } = await supabase
    .from("bot_fluxos")
    .update({ status: "publicado" })
    .eq("id", fluxoId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/fluxogramas");
  revalidatePath(`/fluxogramas/${fluxoId}`);
  return { ok: true };
}

export async function despublicarFluxo(
  fluxoId: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("bot_fluxos")
    .update({ status: "rascunho" })
    .eq("id", fluxoId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/fluxogramas");
  revalidatePath(`/fluxogramas/${fluxoId}`);
  return { ok: true };
}

// ---------- Nós do editor ----------

export type OpcaoInput = {
  valor: string;
  rotulo?: string;
  destino_codigo?: string | null;
};

export type NoInput = {
  codigo: string;
  nome: string;
  tipo:
    | "inicio"
    | "mensagem"
    | "menu_opcoes"
    | "pergunta_aberta"
    | "condicional"
    | "abrir_chamado"
    | "encaminhar_humano"
    | "fim";
  mensagem?: string | null;
  opcoes?: OpcaoInput[];
  campo_contexto?: string | null;
  setor_destino?: string | null;
  chamado_tipo?: string | null;
  prioridade?: "baixa" | "normal" | "alta" | "urgente" | null;
  destino_padrao_codigo?: string | null;
};

const AUTO_SEQUENCIAL: NoInput["tipo"][] = [
  "inicio",
  "mensagem",
  "pergunta_aberta",
  "abrir_chamado",
  "encaminhar_humano",
];

/**
 * Substitui todos os nós e transições do fluxo pela lista enviada.
 * Transições sequenciais (mensagem → próximo item da lista) são geradas
 * automaticamente; ramificações (menu_opcoes/condicional) vêm de
 * `opcoes[].destino_codigo` e `destino_padrao_codigo`, resolvidos por código.
 */
export async function salvarNos(
  fluxoId: string,
  nos: NoInput[]
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: fluxo } = await supabase
    .from("bot_fluxos")
    .select("id")
    .eq("id", fluxoId)
    .single();
  if (!fluxo) return { ok: false, error: "Fluxo não encontrado." };

  const codigos = new Set(nos.map((n) => n.codigo));
  for (const n of nos) {
    for (const o of n.opcoes ?? []) {
      if (o.destino_codigo && !codigos.has(o.destino_codigo)) {
        return {
          ok: false,
          error: `"${n.nome}": ramificação aponta para o código inexistente "${o.destino_codigo}".`,
        };
      }
    }
    if (n.destino_padrao_codigo && !codigos.has(n.destino_padrao_codigo)) {
      return {
        ok: false,
        error: `"${n.nome}": destino padrão aponta para o código inexistente "${n.destino_padrao_codigo}".`,
      };
    }
  }

  await supabase.from("bot_transicoes").delete().eq("fluxo_id", fluxoId);
  await supabase.from("bot_nos").delete().eq("fluxo_id", fluxoId);

  if (nos.length === 0) {
    revalidatePath(`/fluxogramas/${fluxoId}`);
    return { ok: true };
  }

  const registros = nos.map((n, idx) => ({
    fluxo_id: fluxoId,
    codigo: n.codigo,
    nome: n.nome,
    tipo: n.tipo,
    ordem: idx,
    mensagem: n.mensagem || null,
    opcoes: n.opcoes ?? [],
    campo_contexto: n.campo_contexto || null,
    setor_destino: n.setor_destino || null,
    chamado_tipo: n.chamado_tipo || null,
    prioridade: n.prioridade || null,
    destino_padrao_codigo: n.destino_padrao_codigo || null,
  }));

  const { data: inseridos, error } = await supabase
    .from("bot_nos")
    .insert(registros)
    .select("id, codigo, tipo");
  if (error) return { ok: false, error: error.message };

  const porCodigo = new Map(inseridos?.map((x) => [x.codigo, x]) ?? []);

  const transicoes: {
    fluxo_id: string;
    origem_no_id: string;
    destino_no_id: string;
    condicao: { opcao: string } | null;
  }[] = [];

  for (let i = 0; i < nos.length; i++) {
    const n = nos[i];
    const origem = porCodigo.get(n.codigo);
    if (!origem || n.tipo === "fim") continue;

    if (n.tipo === "menu_opcoes" || n.tipo === "condicional") {
      for (const o of n.opcoes ?? []) {
        if (!o.destino_codigo) continue;
        const destino = porCodigo.get(o.destino_codigo);
        if (!destino) continue;
        transicoes.push({
          fluxo_id: fluxoId,
          origem_no_id: origem.id,
          destino_no_id: destino.id,
          condicao: { opcao: o.valor },
        });
      }
      if (n.destino_padrao_codigo) {
        const destino = porCodigo.get(n.destino_padrao_codigo);
        if (destino) {
          transicoes.push({
            fluxo_id: fluxoId,
            origem_no_id: origem.id,
            destino_no_id: destino.id,
            condicao: null,
          });
        }
      }
    } else if (AUTO_SEQUENCIAL.includes(n.tipo) && i < nos.length - 1) {
      const destino = porCodigo.get(nos[i + 1].codigo);
      if (destino) {
        transicoes.push({
          fluxo_id: fluxoId,
          origem_no_id: origem.id,
          destino_no_id: destino.id,
          condicao: null,
        });
      }
    }
  }

  if (transicoes.length > 0) {
    const { error: transErr } = await supabase
      .from("bot_transicoes")
      .insert(transicoes);
    if (transErr) return { ok: false, error: transErr.message };
  }

  revalidatePath(`/fluxogramas/${fluxoId}`);
  return { ok: true };
}
