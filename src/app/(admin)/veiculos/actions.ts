"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const TIPOS_DOCUMENTO = [
  "CRLV",
  "ANTT",
  "CIV",
  "Licenca_Operacional",
  "Licenca_Ambiental",
  "CTe",
  "MDFe",
  "Outro",
] as const;

const BUCKET = "documentos-veiculos";

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
