import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export default async function CadastrosPage() {
  const supabase = await createClient();
  const { data: catalogos, error } = await supabase
    .from("cadastro_catalogos")
    .select("id, codigo, nome, descricao, icone, sistema")
    .order("nome");

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Bot Raja Log — Cadastros"
        title="Catálogos de cadastro"
        description="Filiais, tipos de documento, contatos de notificação — e qualquer outra lista que você queira criar, com campos próprios."
        actions={
          <Button nativeButton={false} render={<Link href="/cadastros/novo" />}>
            ＋ Novo catálogo
          </Button>
        }
      />

      {error && (
        <div className="surface border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Erro ao ler <code>cadastro_catalogos</code>: {error.message}
        </div>
      )}

      {!catalogos?.length ? (
        <div className="surface p-14 text-center">
          <span className="text-4xl opacity-40">📋</span>
          <p className="mt-3 font-medium">Nenhum catálogo cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {catalogos.map((c) => (
            <Link
              key={c.id}
              href={`/cadastros/${c.id}`}
              className="surface flex flex-col gap-1 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{c.icone ?? "📋"}</span>
                <p className="font-medium">{c.nome}</p>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {c.descricao ?? "—"}
              </p>
              {c.sistema && (
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  padrão do sistema
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
