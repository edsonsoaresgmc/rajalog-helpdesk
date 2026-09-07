import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { ItensClient } from "./itens-client";
import { ExcluirCatalogo } from "./excluir-catalogo";
import type { CampoDef } from "../actions";

export default async function CatalogoDetalhePage({
  params,
}: PageProps<"/cadastros/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: catalogo } = await supabase
    .from("cadastro_catalogos")
    .select("id, codigo, nome, descricao, icone, campos, sistema")
    .eq("id", id)
    .single();
  if (!catalogo) notFound();

  const { data: itens } = await supabase
    .from("cadastro_itens")
    .select("id, nome, dados, ativo")
    .eq("catalogo_id", id)
    .order("ordem");

  return (
    <div className="grid gap-6">
      <div className="text-sm">
        <Link
          href="/cadastros"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Voltar para cadastros
        </Link>
      </div>
      <PageHeader
        eyebrow="Bot Raja Log — Cadastros"
        title={`${catalogo.icone ?? "📋"} ${catalogo.nome}`}
        description={catalogo.descricao ?? undefined}
        actions={
          <ExcluirCatalogo catalogoId={catalogo.id} nome={catalogo.nome} />
        }
      />
      <ItensClient
        catalogoId={catalogo.id}
        campos={(catalogo.campos ?? []) as CampoDef[]}
        itensIniciais={itens ?? []}
      />
    </div>
  );
}
