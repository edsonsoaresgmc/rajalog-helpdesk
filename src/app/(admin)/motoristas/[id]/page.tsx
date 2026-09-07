import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { itensDoCatalogo } from "@/lib/cadastros";
import { MotoristaForm } from "../motorista-form";
import { atualizarMotorista } from "../actions";
import { ExcluirMotorista } from "./excluir";

export default async function MotoristaEditarPage({
  params,
}: PageProps<"/motoristas/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: motorista } = await supabase
    .from("motoristas")
    .select("id, matricula, nome, cpf, telefone, cnh, cargo, base, status")
    .eq("id", id)
    .single();
  if (!motorista) notFound();

  const filiais = await itensDoCatalogo("filiais");
  const acao = atualizarMotorista.bind(null, motorista.id);

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
        eyebrow="Bot Raja Log — Cadastro"
        title={`🧑‍✈️ ${motorista.nome}`}
        actions={
          <ExcluirMotorista motoristaId={motorista.id} nome={motorista.nome} />
        }
      />
      <div className="surface max-w-2xl p-6">
        <MotoristaForm
          action={acao}
          valores={motorista}
          filiais={filiais}
          submitLabel="Salvar alterações"
        />
      </div>
    </div>
  );
}
