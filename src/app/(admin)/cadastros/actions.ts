"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type CampoDef = {
  chave: string;
  rotulo: string;
  tipo: "texto" | "numero" | "data" | "booleano";
};

export type CriarCatalogoState = { error: string | null };

export async function criarCatalogo(
  _prev: CriarCatalogoState,
  formData: FormData
): Promise<CriarCatalogoState> {
  await requireAdmin();
  const nome = String(formData.get("nome") ?? "").trim();
  const codigo = String(formData.get("codigo") ?? "").trim().toLowerCase();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const icone = String(formData.get("icone") ?? "").trim() || "📋";

  const chaves = formData.getAll("campo_chave") as string[];
  const rotulos = formData.getAll("campo_rotulo") as string[];
  const tipos = formData.getAll("campo_tipo") as string[];
  const campos: CampoDef[] = chaves
    .map((chave, i) => ({
      chave: chave.trim().toLowerCase().replace(/\s+/g, "_"),
      rotulo: (rotulos[i] ?? "").trim(),
      tipo: (tipos[i] ?? "texto") as CampoDef["tipo"],
    }))
    .filter((c) => c.chave && c.rotulo);

  if (!nome) return { error: "Informe o nome." };
  if (!/^[a-z][a-z0-9_]{1,39}$/.test(codigo))
    return {
      error:
        "Código deve começar com letra minúscula e usar apenas letras, números e underline.",
    };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cadastro_catalogos")
    .insert({ nome, codigo, descricao: descricao || null, icone, campos })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error: error?.message.includes("duplicate")
        ? "Já existe um catálogo com esse código."
        : (error?.message ?? "Erro ao criar."),
    };
  }

  revalidatePath("/cadastros");
  redirect(`/cadastros/${data.id}`);
}

export async function excluirCatalogo(
  catalogoId: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("cadastro_catalogos")
    .delete()
    .eq("id", catalogoId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/cadastros");
  return { ok: true };
}

// ---------- Itens ----------

export type ItemInput = {
  id?: string;
  nome: string;
  dados: Record<string, string | boolean>;
  ativo: boolean;
};

export async function salvarItem(
  catalogoId: string,
  item: ItemInput
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  if (item.id) {
    const { error } = await supabase
      .from("cadastro_itens")
      .update({ nome: item.nome, dados: item.dados, ativo: item.ativo })
      .eq("id", item.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { count } = await supabase
      .from("cadastro_itens")
      .select("id", { count: "exact", head: true })
      .eq("catalogo_id", catalogoId);
    const { error } = await supabase.from("cadastro_itens").insert({
      catalogo_id: catalogoId,
      nome: item.nome,
      dados: item.dados,
      ativo: item.ativo,
      ordem: count ?? 0,
    });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/cadastros/${catalogoId}`);
  return { ok: true };
}

export async function excluirItem(
  catalogoId: string,
  itemId: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("cadastro_itens")
    .delete()
    .eq("id", itemId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/cadastros/${catalogoId}`);
  return { ok: true };
}
