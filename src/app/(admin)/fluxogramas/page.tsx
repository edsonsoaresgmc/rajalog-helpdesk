import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatarDataHora } from "@/lib/formatters";

const STATUS_COR: Record<string, string> = {
  publicado: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  rascunho: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  arquivado: "bg-muted text-muted-foreground",
};

export default async function FluxogramasPage() {
  const supabase = await createClient();

  const { data: fluxos } = await supabase
    .from("bot_fluxos")
    .select(
      "id, nome, codigo, descricao, status, icone, prioridade_seguranca, gatilho_palavras, updated_at"
    )
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Bot Raja Log — Motoristas"
        title="Fluxogramas do bot"
        description="Cadastre e edite os fluxos de conversa do Help Desk dos motoristas: cada opção do menu do WhatsApp vira um fluxograma com mensagens, perguntas, ramificações e abertura de chamados."
        actions={
          <Button
            nativeButton={false}
            render={<Link href="/fluxogramas/novo" />}
          >
            ＋ Novo fluxo
          </Button>
        }
      />

      {!fluxos?.length ? (
        <div className="surface p-14 text-center">
          <span className="text-4xl opacity-40">🚛</span>
          <p className="mt-3 font-medium">Nenhum fluxo cadastrado</p>
          <p className="text-sm text-muted-foreground">
            Crie o primeiro fluxo (ex.: Sinistro, Checklist, Documentos do
            Veículo) para começar a montar o atendimento do bot.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {fluxos.map((f) => (
            <Link
              key={f.id}
              href={`/fluxogramas/${f.id}`}
              className="surface group flex flex-wrap items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-lg">
                {f.icone ?? "🚛"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="font-medium leading-snug">{f.nome}</p>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {f.codigo}
                  </code>
                  {f.prioridade_seguranca && (
                    <Badge className="bg-red-500/12 text-red-700 dark:text-red-400">
                      ⚠ prioridade de segurança
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                  {f.descricao ?? "—"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <Badge className={STATUS_COR[f.status] ?? ""}>
                    {f.status}
                  </Badge>
                  {f.gatilho_palavras?.length > 0 && (
                    <span>
                      · gatilhos: {f.gatilho_palavras.slice(0, 4).join(", ")}
                      {f.gatilho_palavras.length > 4 ? "…" : ""}
                    </span>
                  )}
                  <span>· atualizado {formatarDataHora(f.updated_at)}</span>
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
