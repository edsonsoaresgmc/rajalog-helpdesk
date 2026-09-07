"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  salvarNos,
  publicarFluxo,
  despublicarFluxo,
  type NoInput,
  type OpcaoInput,
} from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const TIPOS: { valor: NoInput["tipo"]; rotulo: string; icone: string }[] = [
  { valor: "mensagem", rotulo: "Mensagem", icone: "💬" },
  { valor: "menu_opcoes", rotulo: "Menu de opções", icone: "📋" },
  { valor: "pergunta_aberta", rotulo: "Pergunta aberta", icone: "✍️" },
  { valor: "condicional", rotulo: "Condicional", icone: "⇢" },
  { valor: "abrir_chamado", rotulo: "Abrir chamado", icone: "🎫" },
  { valor: "encaminhar_humano", rotulo: "Encaminhar humano", icone: "🆘" },
  { valor: "fim", rotulo: "Fim", icone: "🏁" },
];

const SETORES = [
  "documentacao",
  "fiscal",
  "ssma",
  "manutencao",
  "financeiro",
  "ti",
  "outro",
];

const PRIORIDADES = ["baixa", "normal", "alta", "urgente"];

interface Props {
  fluxoId: string;
  fluxoStatus: string;
  nosIniciais: NoInput[];
}

export function EditorNos({ fluxoId, fluxoStatus, nosIniciais }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(fluxoStatus);
  const [nos, setNos] = useState<NoInput[]>(nosIniciais);
  const [selecionado, setSelecionado] = useState<number | null>(
    nosIniciais.length > 0 ? 0 : null
  );
  const [sujo, setSujo] = useState(false);
  const [pending, startTransition] = useTransition();

  function novoCodigo(tipo: NoInput["tipo"]) {
    const base = tipo.slice(0, 4);
    let n = 1;
    const existentes = new Set(nos.map((x) => x.codigo));
    while (existentes.has(`${base}_${n}`)) n++;
    return `${base}_${n}`;
  }

  function adicionar(tipo: NoInput["tipo"]) {
    const codigo = novoCodigo(tipo);
    const nova: NoInput = {
      codigo,
      nome:
        tipo === "fim"
          ? "Fim do fluxo"
          : TIPOS.find((t) => t.valor === tipo)?.rotulo ?? "Novo nó",
      tipo,
      opcoes: [],
    };
    const idxFim = nos.findIndex((n) => n.tipo === "fim");
    let novos: NoInput[];
    if (idxFim >= 0 && tipo !== "fim") {
      novos = [...nos.slice(0, idxFim), nova, ...nos.slice(idxFim)];
      setSelecionado(idxFim);
    } else {
      novos = [...nos, nova];
      setSelecionado(nos.length);
    }
    setNos(novos);
    setSujo(true);
  }

  function atualizar(idx: number, patch: Partial<NoInput>) {
    setNos(nos.map((n, i) => (i === idx ? { ...n, ...patch } : n)));
    setSujo(true);
  }

  function remover(idx: number) {
    if (!confirm(`Remover "${nos[idx].nome}"?`)) return;
    setNos(nos.filter((_, i) => i !== idx));
    if (selecionado === idx) setSelecionado(null);
    setSujo(true);
  }

  function mover(idx: number, dir: -1 | 1) {
    const alvo = idx + dir;
    if (alvo < 0 || alvo >= nos.length) return;
    const copia = [...nos];
    [copia[idx], copia[alvo]] = [copia[alvo], copia[idx]];
    setNos(copia);
    setSelecionado(alvo);
    setSujo(true);
  }

  function salvar() {
    const codigos = nos.map((n) => n.codigo.trim());
    if (codigos.some((c) => !c)) {
      toast.error("Todo nó precisa de um código.");
      return;
    }
    if (new Set(codigos).size !== codigos.length) {
      toast.error("Existem códigos duplicados entre os nós.");
      return;
    }
    startTransition(async () => {
      const res = await salvarNos(fluxoId, nos);
      if (res.ok) {
        setSujo(false);
        toast.success("Fluxo salvo");
        router.refresh();
      } else {
        toast.error(res.error ?? "Falha ao salvar");
      }
    });
  }

  function publicar() {
    if (sujo) {
      toast.error("Salve antes de publicar");
      return;
    }
    startTransition(async () => {
      const res = await publicarFluxo(fluxoId);
      if (res.ok) {
        toast.success("Fluxo publicado");
        setStatus("publicado");
        router.refresh();
      } else toast.error(res.error ?? "Falha ao publicar");
    });
  }

  function despublicar() {
    startTransition(async () => {
      const res = await despublicarFluxo(fluxoId);
      if (res.ok) {
        toast.success("Fluxo voltou para rascunho");
        setStatus("rascunho");
        router.refresh();
      } else toast.error(res.error ?? "Falha ao despublicar");
    });
  }

  const n = selecionado != null ? nos[selecionado] : null;
  const outrosCodigos = nos
    .filter((_, i) => i !== selecionado)
    .map((x) => ({ codigo: x.codigo, nome: x.nome }));

  function atualizarOpcoes(novas: OpcaoInput[]) {
    if (selecionado == null) return;
    atualizar(selecionado, { opcoes: novas });
  }

  return (
    <div className="grid gap-4">
      <div className="surface flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="flex items-center gap-2">
          <Badge variant={status === "publicado" ? "secondary" : "default"}>
            {status === "publicado" ? "Publicado" : "Rascunho"}
          </Badge>
          {sujo && (
            <span className="text-xs text-muted-foreground">
              Alterações não salvas
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TIPOS.map((t) => (
            <Button
              key={t.valor}
              variant="outline"
              size="sm"
              onClick={() => adicionar(t.valor)}
              title={`Adicionar ${t.rotulo}`}
            >
              ＋ {t.icone} {t.rotulo}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={salvar} disabled={pending || !sujo}>
            Salvar
          </Button>
          {status === "publicado" ? (
            <Button variant="outline" size="sm" onClick={despublicar} disabled={pending}>
              Voltar para rascunho
            </Button>
          ) : (
            <Button size="sm" onClick={publicar} disabled={pending || sujo}>
              Publicar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        {/* Lista de nós */}
        <div className="surface p-4">
          {nos.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Adicione nós usando os botões acima.
            </p>
          ) : (
            <ol className="grid gap-2">
              {nos.map((no, idx) => {
                const t = TIPOS.find((x) => x.valor === no.tipo);
                const icone = no.tipo === "inicio" ? "🚀" : t?.icone ?? "•";
                const rotulo = no.tipo === "inicio" ? "Início" : t?.rotulo ?? no.tipo;
                return (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => setSelecionado(idx)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        selecionado === idx
                          ? "border-primary/60 bg-primary/5"
                          : "border-border/60 hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{icone}</span>
                            <span className="font-medium">{no.nome}</span>
                            <code className="text-[10px] text-muted-foreground">
                              {no.codigo}
                            </code>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {rotulo}
                            {no.setor_destino ? ` · setor: ${no.setor_destino}` : ""}
                            {no.prioridade ? ` · prioridade ${no.prioridade}` : ""}
                          </p>
                        </div>
                        <div
                          className="flex items-center gap-1 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => mover(idx, -1)}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Mover para cima"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => mover(idx, 1)}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Mover para baixo"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => remover(idx)}
                            className="text-destructive/70 hover:text-destructive"
                            aria-label="Remover"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Propriedades do nó selecionado */}
        <aside className="surface p-4">
          {!n ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Selecione um nó para editar.
            </p>
          ) : (
            <div className="grid gap-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Propriedades
              </p>
              <div className="grid gap-1">
                <Label>Nome</Label>
                <Input
                  value={n.nome}
                  onChange={(e) => atualizar(selecionado!, { nome: e.target.value })}
                />
              </div>
              <div className="grid gap-1">
                <Label>Código</Label>
                <Input
                  value={n.codigo}
                  onChange={(e) =>
                    atualizar(selecionado!, {
                      codigo: e.target.value.trim().toLowerCase().replace(/\s+/g, "_"),
                    })
                  }
                  className="font-mono"
                  disabled={n.tipo === "inicio"}
                />
              </div>

              {(n.tipo === "inicio" ||
                n.tipo === "mensagem" ||
                n.tipo === "menu_opcoes" ||
                n.tipo === "pergunta_aberta" ||
                n.tipo === "abrir_chamado" ||
                n.tipo === "encaminhar_humano" ||
                n.tipo === "fim") && (
                <div className="grid gap-1">
                  <Label>Mensagem enviada ao motorista</Label>
                  <Textarea
                    rows={3}
                    value={n.mensagem ?? ""}
                    onChange={(e) => atualizar(selecionado!, { mensagem: e.target.value })}
                    placeholder="Texto que o bot envia neste passo..."
                  />
                </div>
              )}

              {n.tipo === "pergunta_aberta" && (
                <div className="grid gap-1">
                  <Label>Campo de contexto *</Label>
                  <Input
                    value={n.campo_contexto ?? ""}
                    onChange={(e) =>
                      atualizar(selecionado!, { campo_contexto: e.target.value.trim() })
                    }
                    placeholder="Ex.: descricao_sinistro"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    A resposta livre do motorista é gravada com esta chave em
                    sessoes.contexto_json.
                  </p>
                </div>
              )}

              {(n.tipo === "menu_opcoes" || n.tipo === "condicional") && (
                <>
                  {n.tipo === "condicional" && (
                    <div className="grid gap-1">
                      <Label>Campo testado *</Label>
                      <Input
                        value={n.campo_contexto ?? ""}
                        onChange={(e) =>
                          atualizar(selecionado!, {
                            campo_contexto: e.target.value.trim(),
                          })
                        }
                        placeholder="Ex.: algum_item_defeito"
                        className="font-mono"
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label>
                        {n.tipo === "menu_opcoes" ? "Opções do menu" : "Valores testados"}
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          atualizarOpcoes([...(n.opcoes ?? []), { valor: "", destino_codigo: null }])
                        }
                      >
                        ＋ opção
                      </Button>
                    </div>
                    {(n.opcoes ?? []).length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Nenhuma opção — adicione ao menos uma.
                      </p>
                    )}
                    <div className="grid gap-2">
                      {(n.opcoes ?? []).map((o, oi) => (
                        <div
                          key={oi}
                          className="grid gap-1.5 rounded-md border border-border/60 p-2"
                        >
                          <div className="grid grid-cols-2 gap-1.5">
                            <Input
                              placeholder="valor"
                              value={o.valor}
                              className="font-mono text-xs"
                              onChange={(e) => {
                                const copia = [...(n.opcoes ?? [])];
                                copia[oi] = { ...o, valor: e.target.value };
                                atualizarOpcoes(copia);
                              }}
                            />
                            {n.tipo === "menu_opcoes" && (
                              <Input
                                placeholder="rótulo exibido"
                                value={o.rotulo ?? ""}
                                className="text-xs"
                                onChange={(e) => {
                                  const copia = [...(n.opcoes ?? [])];
                                  copia[oi] = { ...o, rotulo: e.target.value };
                                  atualizarOpcoes(copia);
                                }}
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <select
                              value={o.destino_codigo ?? ""}
                              onChange={(e) => {
                                const copia = [...(n.opcoes ?? [])];
                                copia[oi] = { ...o, destino_codigo: e.target.value || null };
                                atualizarOpcoes(copia);
                              }}
                              className="h-8 flex-1 rounded-md border border-border/70 bg-background px-2 text-xs"
                            >
                              <option value="">— destino —</option>
                              {outrosCodigos.map((c) => (
                                <option key={c.codigo} value={c.codigo}>
                                  {c.nome} ({c.codigo})
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() =>
                                atualizarOpcoes((n.opcoes ?? []).filter((_, i) => i !== oi))
                              }
                              className="text-destructive/70 hover:text-destructive"
                              aria-label="Remover opção"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-1">
                    <Label className="text-xs">
                      {n.tipo === "menu_opcoes"
                        ? "Destino padrão (resposta não reconhecida)"
                        : "Destino padrão (senão)"}
                    </Label>
                    <select
                      value={n.destino_padrao_codigo ?? ""}
                      onChange={(e) =>
                        atualizar(selecionado!, {
                          destino_padrao_codigo: e.target.value || null,
                        })
                      }
                      className="h-9 rounded-md border border-border/70 bg-background px-3 text-sm"
                    >
                      <option value="">— nenhum —</option>
                      {outrosCodigos.map((c) => (
                        <option key={c.codigo} value={c.codigo}>
                          {c.nome} ({c.codigo})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {(n.tipo === "abrir_chamado" || n.tipo === "encaminhar_humano") && (
                <>
                  <div className="grid gap-1">
                    <Label>Setor destino *</Label>
                    <select
                      value={n.setor_destino ?? ""}
                      onChange={(e) =>
                        atualizar(selecionado!, { setor_destino: e.target.value || null })
                      }
                      className="h-9 rounded-md border border-border/70 bg-background px-3 text-sm"
                    >
                      <option value="">— Selecione —</option>
                      {SETORES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  {n.tipo === "abrir_chamado" && (
                    <div className="grid gap-1">
                      <Label>Tipo do chamado</Label>
                      <Input
                        value={n.chamado_tipo ?? ""}
                        onChange={(e) =>
                          atualizar(selecionado!, { chamado_tipo: e.target.value })
                        }
                        placeholder="Ex.: renovacao_documento"
                        className="font-mono"
                      />
                    </div>
                  )}
                  <div className="grid gap-1">
                    <Label>Prioridade</Label>
                    <select
                      value={n.prioridade ?? ""}
                      onChange={(e) =>
                        atualizar(selecionado!, {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          prioridade: (e.target.value || null) as any,
                        })
                      }
                      className="h-9 rounded-md border border-border/70 bg-background px-3 text-sm"
                    >
                      <option value="">—</option>
                      {PRIORIDADES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {n.tipo === "inicio" && (
                <p className="rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
                  Este é o ponto de entrada do fluxo. Segue automaticamente
                  para o próximo nó da lista.
                </p>
              )}
              {n.tipo === "fim" && (
                <p className="rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
                  Encerra o fluxo. Não tem saída.
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
