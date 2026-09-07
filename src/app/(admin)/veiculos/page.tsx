import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function VeiculosPage() {
  const supabase = await createClient();
  const { data: veiculos, error } = await supabase
    .from("veiculos")
    .select("id, placa, frota, tipo, marca, modelo, ano, status")
    .order("placa");

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Bot Raja Log — Frota"
        title="Veículos e documentos"
        description="Envie os documentos (CRLV, ANTT, CIV...) de cada veículo — o bot usa esses arquivos para responder aos motoristas no Módulo 1 (Documentos do Veículo)."
        actions={
          <Button nativeButton={false} render={<Link href="/veiculos/novo" />}>
            ＋ Novo veículo
          </Button>
        }
      />

      {error && (
        <div className="surface border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Erro ao ler a tabela <code>veiculos</code>: {error.message}
        </div>
      )}

      {!veiculos?.length ? (
        <div className="surface p-14 text-center">
          <span className="text-4xl opacity-40">🚚</span>
          <p className="mt-3 font-medium">Nenhum veículo encontrado</p>
          <p className="text-sm text-muted-foreground">
            A tabela <code>veiculos</code> está vazia neste projeto.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {veiculos.map((v) => (
            <Link
              key={v.id}
              href={`/veiculos/${v.id}`}
              className="surface flex flex-col gap-1 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-lg font-semibold">{v.placa}</p>
                {v.status && <Badge variant="secondary">{v.status}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                {[v.marca, v.modelo, v.ano].filter(Boolean).join(" · ") || "—"}
              </p>
              {v.frota && (
                <p className="text-xs text-muted-foreground">Frota: {v.frota}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
