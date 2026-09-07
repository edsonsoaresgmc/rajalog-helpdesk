import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { itensDoCatalogo } from "@/lib/cadastros";
import { MotoristaForm } from "../motorista-form";
import { criarMotorista } from "../actions";

export default async function NovoMotoristaPage() {
  const filiais = await itensDoCatalogo("filiais");

  return (
    <div className="grid gap-6">
      <div className="text-sm">
        <Link
          href="/motoristas"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Voltar para motoristas
        </Link>
      </div>
      <PageHeader
        eyebrow="Novo motorista"
        title="Cadastrar motorista"
        description="A matrícula (ou o telefone, depois de cadastrado) é o que o motorista usa para se identificar no bot."
      />
      <div className="surface max-w-2xl p-6">
        <MotoristaForm
          action={criarMotorista}
          filiais={filiais}
          submitLabel="Cadastrar"
        />
      </div>
    </div>
  );
}
