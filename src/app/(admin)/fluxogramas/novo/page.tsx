import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { NovoFluxoForm } from "./novo-form";

export default async function NovoFluxoPage() {
  return (
    <div className="grid gap-6">
      <div className="text-sm">
        <Link
          href="/fluxogramas"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Voltar para fluxogramas do bot
        </Link>
      </div>
      <PageHeader
        eyebrow="Novo fluxo"
        title="Criar fluxograma do bot"
        description="Preencha os dados básicos. Depois você monta os nós (mensagens, perguntas, ramificações, chamados) no editor."
      />
      <div className="surface max-w-2xl p-6">
        <NovoFluxoForm />
      </div>
    </div>
  );
}
