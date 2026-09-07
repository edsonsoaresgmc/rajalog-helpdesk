import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { itensDoCatalogo } from "@/lib/cadastros";
import { VeiculoForm } from "../veiculo-form";
import { atualizarVeiculo } from "../actions";
import { ExcluirVeiculo } from "./excluir-veiculo";
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

  const [{ data: documentos }, tiposDocumento] = await Promise.all([
    supabase
      .from("documentos")
      .select("id, tipo, arquivo_url, data_validade, status")
      .eq("veiculo_id", id)
      .order("tipo"),
    itensDoCatalogo("tipos_documento"),
  ]);

  const acao = atualizarVeiculo.bind(null, veiculo.id);

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
        actions={<ExcluirVeiculo veiculoId={veiculo.id} placa={veiculo.placa} />}
      />

      <details className="surface p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Editar dados do veículo
        </summary>
        <div className="mt-4">
          <VeiculoForm
            action={acao}
            valores={veiculo}
            submitLabel="Salvar alterações"
          />
        </div>
      </details>

      <DocumentosClient
        veiculoId={veiculo.id}
        documentosIniciais={documentos ?? []}
        tiposDocumento={
          tiposDocumento.length > 0
            ? tiposDocumento
            : ["CRLV", "ANTT", "CIV", "Licenca_Operacional", "Licenca_Ambiental", "CTe", "MDFe", "Outro"]
        }
      />
    </div>
  );
}
