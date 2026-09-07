"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

const BUCKET = "documentos-veiculos";

export type VeiculoState = { error: string | null };

function extrairCamposVeiculo(formData: FormData) {
  return {
    placa: String(formData.get("placa") ?? "").trim().toUpperCase(),
    frota: String(formData.get("frota") ?? "").trim() || null,
    tipo: String(formData.get("tipo") ?? "").trim() || null,
    marca: String(formData.get("marca") ?? "").trim() || null,
    modelo: String(formData.get("modelo") ?? "").trim() || null,
    ano: formData.get("ano") ? Number(formData.get("ano")) : null,
    status: String(formData.get("status") ?? "ativo"),
  };
}

export async function criarVeiculo(
  _prev: VeiculoState,
  formData: FormData
): Promise<VeiculoState> {
  await requireAdmin();
  const campos = extrairCamposVeiculo(formData);
  if (!campos.placa) return { error: "Informe a placa." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("veiculos")
    .insert(campos)
    .select("id")
    .single();

  if (error || !data) {
    return {
      error: error?.message.includes("duplicate")
        ? "Já existe um veículo com essa placa."
        : (error?.message ?? "Erro ao criar."),
    };
  }

  revalidatePath("/veiculos");
  redirect(`/veiculos/${data.id}`);
}

export async function atualizarVeiculo(
  veiculoId: string,
  _prev: VeiculoState,
  formData: FormData
): Promise<VeiculoState> {
  await requireAdmin();
  const campos = extrairCamposVeiculo(formData);
  if (!campos.placa) return { error: "Informe a placa." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("veiculos")
    .update(campos)
    .eq("id", veiculoId);
  if (error) return { error: error.message };

  revalidatePath("/veiculos");
  revalidatePath(`/veiculos/${veiculoId}`);
  redirect(`/veiculos/${veiculoId}`);
}

export async function excluirVeiculo(
  veiculoId: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("veiculos").delete().eq("id", veiculoId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/veiculos");
  return { ok: true };
}

export type UploadState = { error: string | null; ok?: boolean };

export async function uploadDocumento(
  veiculoId: string,
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  await requireAdmin();

  const tipo = String(formData.get("tipo") ?? "");
  const dataValidade = String(formData.get("data_validade") ?? "") || null;
  const file = formData.get("arquivo") as File | null;

  if (!tipo) return { error: "Selecione o tipo de documento." };
  if (!file || file.size === 0) return { error: "Selecione um arquivo." };

  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "pdf";
  const path = `${veiculoId}/${tipo}-${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined });
  if (upErr) return { error: upErr.message };

  const vencido = dataValidade ? new Date(dataValidade) < new Date() : false;

  const { error } = await supabase.from("documentos").insert({
    veiculo_id: veiculoId,
    tipo,
    arquivo_url: path,
    data_validade: dataValidade,
    status: vencido ? "vencido" : "valido",
  });

  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    return { error: error.message };
  }

  revalidatePath(`/veiculos/${veiculoId}`);
  return { error: null, ok: true };
}

export async function excluirDocumento(
  veiculoId: string,
  documentoId: string,
  arquivoPath: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.storage.from(BUCKET).remove([arquivoPath]);
  const { error } = await supabase
    .from("documentos")
    .delete()
    .eq("id", documentoId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/veiculos/${veiculoId}`);
  return { ok: true };
}

export async function urlAssinada(path: string): Promise<string | null> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60);
  if (error) return null;
  return data.signedUrl;
}
