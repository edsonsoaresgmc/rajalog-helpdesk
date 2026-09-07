"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type MotoristaState = { error: string | null };

function extrairCampos(formData: FormData) {
  return {
    matricula: String(formData.get("matricula") ?? "").trim(),
    nome: String(formData.get("nome") ?? "").trim(),
    cpf: String(formData.get("cpf") ?? "").trim() || null,
    telefone: String(formData.get("telefone") ?? "").trim() || null,
    cnh: String(formData.get("cnh") ?? "").trim() || null,
    cargo: String(formData.get("cargo") ?? "").trim() || null,
    base: String(formData.get("base") ?? "").trim() || null,
    status: String(formData.get("status") ?? "ativo"),
  };
}

export async function criarMotorista(
  _prev: MotoristaState,
  formData: FormData
): Promise<MotoristaState> {
  await requireAdmin();
  const campos = extrairCampos(formData);
  if (!campos.matricula) return { error: "Informe a matrícula." };
  if (!campos.nome) return { error: "Informe o nome." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("motoristas")
    .insert(campos)
    .select("id")
    .single();

  if (error || !data) {
    return {
      error: error?.message.includes("duplicate")
        ? "Já existe um motorista com essa matrícula."
        : (error?.message ?? "Erro ao criar."),
    };
  }

  revalidatePath("/motoristas");
  redirect(`/motoristas/${data.id}`);
}

export async function atualizarMotorista(
  motoristaId: string,
  _prev: MotoristaState,
  formData: FormData
): Promise<MotoristaState> {
  await requireAdmin();
  const campos = extrairCampos(formData);
  if (!campos.matricula) return { error: "Informe a matrícula." };
  if (!campos.nome) return { error: "Informe o nome." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("motoristas")
    .update(campos)
    .eq("id", motoristaId);
  if (error) return { error: error.message };

  revalidatePath("/motoristas");
  revalidatePath(`/motoristas/${motoristaId}`);
  redirect("/motoristas");
}

export async function excluirMotorista(
  motoristaId: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("motoristas")
    .delete()
    .eq("id", motoristaId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/motoristas");
  return { ok: true };
}
