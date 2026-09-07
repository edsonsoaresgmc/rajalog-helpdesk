import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function MotoristasPage() {
  const supabase = await createClient();
  const { data: motoristas, error } = await supabase
    .from("motoristas")
    .select("id, matricula, nome, telefone, cargo, base, status")
    .order("nome");

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Bot Raja Log — Cadastro"
        title="Motoristas"
        description="Cadastro dos motoristas atendidos pelo Help Desk — matrícula, telefone (login por WhatsApp) e vínculo com a base."
        actions={
          <Button nativeButton={false} render={<Link href="/motoristas/novo" />}>
            ＋ Novo motorista
          </Button>
        }
      />

      {error && (
        <div className="surface border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Erro ao ler a tabela <code>motoristas</code>: {error.message}
        </div>
      )}

      {!motoristas?.length ? (
        <div className="surface p-14 text-center">
          <span className="text-4xl opacity-40">🧑‍✈️</span>
          <p className="mt-3 font-medium">Nenhum motorista cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {motoristas.map((m) => (
            <Link
              key={m.id}
              href={`/motoristas/${m.id}`}
              className="surface group flex flex-wrap items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-lg">
                🧑‍✈️
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="font-medium leading-snug">{m.nome}</p>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {m.matricula}
                  </code>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <Badge variant={m.status === "inativo" ? "secondary" : "default"}>
                    {m.status ?? "—"}
                  </Badge>
                  {m.cargo && <span>· {m.cargo}</span>}
                  {m.base && <span>· {m.base}</span>}
                  {m.telefone && <span>· {m.telefone}</span>}
                </div>
              </div>
              <span className="text-muted-foreground transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
