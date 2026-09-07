import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { EditorNos } from "./editor-nos";
import { ExcluirFluxo } from "./excluir";
import type { NoInput } from "../actions";

const STATUS_COR: Record<string, string> = {
  publicado: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  rascunho: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  arquivado: "bg-muted text-muted-foreground",
};

export default async function FluxoEditorPage({
  params,
}: PageProps<"/fluxogramas/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: fluxo } = await supabase
    .from("bot_fluxos")
    .select(
      "id, nome, codigo, descricao, icone, status, gatilho_palavras, prioridade_seguranca"
    )
    .eq("id", id)
    .single();
  if (!fluxo) notFound();

  const { data: nosRaw } = await supabase
    .from("bot_nos")
    .select(
      "codigo, nome, tipo, mensagem, opcoes, campo_contexto, setor_destino, chamado_tipo, prioridade, destino_padrao_codigo"
    )
    .eq("fluxo_id", id)
    .order("ordem");

  const nos: NoInput[] = (nosRaw ?? []).map((n) => ({
    codigo: n.codigo,
    nome: n.nome,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tipo: n.tipo as any,
    mensagem: n.mensagem,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    opcoes: (n.opcoes ?? []) as any,
    campo_contexto: n.campo_contexto,
    setor_destino: n.setor_destino,
    chamado_tipo: n.chamado_tipo,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prioridade: n.prioridade as any,
    destino_padrao_codigo: n.destino_padrao_codigo,
  }));

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
        eyebrow="Bot Raja Log — Motoristas"
        title={
          <span>
            {fluxo.icone ?? "🚛"} {fluxo.nome}{" "}
            <code className="ml-2 rounded bg-muted px-2 py-0.5 text-sm font-mono text-muted-foreground">
              {fluxo.codigo}
            </code>
          </span>
        }
        description={fluxo.descricao ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <Badge className={STATUS_COR[fluxo.status] ?? ""}>
              {fluxo.status}
            </Badge>
            {fluxo.prioridade_seguranca && (
              <Badge className="bg-red-500/12 text-red-700 dark:text-red-400">
                ⚠ prioridade de segurança
              </Badge>
            )}
            <ExcluirFluxo fluxoId={fluxo.id} nome={fluxo.nome} />
          </div>
        }
      />

      {fluxo.gatilho_palavras?.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Gatilhos: {fluxo.gatilho_palavras.join(", ")}
        </p>
      )}

      <EditorNos
        fluxoId={fluxo.id}
        fluxoStatus={fluxo.status}
        nosIniciais={nos}
      />
    </div>
  );
}
