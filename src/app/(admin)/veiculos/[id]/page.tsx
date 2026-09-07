import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { DocumentosClient } from "./documentos-client";

export default async function VeiculoDetalhePage({
  params,
}: PageProps<"/veiculos/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: veiculo } = await supabase
    .from("veiculos")
    .select("id, placa, frota, tipo, marca, modelo, ano, status")
    .eq("id", id)
    .single();
  if (!veiculo) notFound();

  const { data: documentos } = await supabase
    .from("documentos")
    .select("id, tipo, arquivo_url, data_validade, status")
    .eq("veiculo_id", id)
    .order("tipo");

  return (
    <div className="grid gap-6">
      <div className="text-sm">
        <Link
          href="/veiculos"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Voltar para veículos
        </Link>
      </div>
      <PageHeader
        eyebrow="Bot Raja Log — Frota"
        title={`🚚 ${veiculo.placa}`}
        description={
          [veiculo.marca, veiculo.modelo, veiculo.ano].filter(Boolean).join(" · ") ||
          undefined
        }
      />
      <DocumentosClient veiculoId={veiculo.id} documentosIniciais={documentos ?? []} />
    </div>
  );
}
