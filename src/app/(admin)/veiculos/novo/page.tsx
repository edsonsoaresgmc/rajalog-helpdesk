import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { VeiculoForm } from "../veiculo-form";
import { criarVeiculo } from "../actions";

export default function NovoVeiculoPage() {
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
        eyebrow="Novo veículo"
        title="Cadastrar veículo"
        description="Depois de criado, você pode enviar os documentos (CRLV, ANTT, CIV...) na página do veículo."
      />
      <div className="surface max-w-2xl p-6">
        <VeiculoForm action={criarVeiculo} submitLabel="Cadastrar" />
      </div>
    </div>
  );
}
