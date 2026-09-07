import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { NovoCatalogoForm } from "./novo-form";

export default function NovoCatalogoPage() {
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
        eyebrow="Novo catálogo"
        title="Criar catálogo de cadastro"
        description="Defina o nome e, se precisar, campos extras para cada item — depois você cadastra os itens na página do catálogo."
      />
      <div className="surface max-w-2xl p-6">
        <NovoCatalogoForm />
      </div>
    </div>
  );
}
