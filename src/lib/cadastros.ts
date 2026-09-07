import { createClient } from "@/lib/supabase/server";

/** Nomes dos itens ativos de um catálogo de cadastro, pelo código do catálogo. */
export async function itensDoCatalogo(codigo: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cadastro_itens")
    .select("nome, ativo, ordem, cadastro_catalogos!inner(codigo)")
    .eq("cadastro_catalogos.codigo", codigo)
    .eq("ativo", true)
    .order("ordem");
  return (data ?? []).map((d) => d.nome);
}
