"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { salvarItem, excluirItem, type CampoDef } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Item = {
  id: string;
  nome: string;
  dados: Record<string, string | boolean> | null;
  ativo: boolean;
};

export function ItensClient({
  catalogoId,
  campos,
  itensIniciais,
}: {
  catalogoId: string;
  campos: CampoDef[];
  itensIniciais: Item[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [dados, setDados] = useState<Record<string, string | boolean>>({});
  const [ativo, setAtivo] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  function editar(item: Item) {
    setEditandoId(item.id);
    setNome(item.nome);
    setDados(item.dados ?? {});
    setAtivo(item.ativo);
    setErro(null);
  }

  function limpar() {
    setEditandoId(null);
    setNome("");
    setDados({});
    setAtivo(true);
    setErro(null);
  }

  function salvar() {
    if (!nome.trim()) {
      setErro("Informe o nome.");
      return;
    }
    setErro(null);
    startTransition(async () => {
      const res = await salvarItem(catalogoId, {
        id: editandoId ?? undefined,
        nome: nome.trim(),
        dados,
        ativo,
      });
      if (res.ok) {
        toast.success(editandoId ? "Item atualizado" : "Item adicionado");
        limpar();
        router.refresh();
      } else {
        toast.error(res.error ?? "Falha ao salvar");
      }
    });
  }

  function remover(item: Item) {
    if (!confirm(`Remover "${item.nome}"?`)) return;
    startTransition(async () => {
      const res = await excluirItem(catalogoId, item.id);
      if (res.ok) {
        toast.success("Item removido");
        if (editandoId === item.id) limpar();
        router.refresh();
      } else {
        toast.error(res.error ?? "Falha ao remover");
      }
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="surface p-4">
        <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          Itens cadastrados
        </p>
        {itensIniciais.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum item ainda.
          </p>
        ) : (
          <ul className="grid gap-2">
            {itensIniciais.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.nome}</p>
                  {campos.length > 0 && (
                    <p className="truncate text-xs text-muted-foreground">
                      {campos
                        .map((c) => {
                          const v = item.dados?.[c.chave];
                          if (v === undefined || v === "" || v === null)
                            return null;
                          return `${c.rotulo}: ${
                            typeof v === "boolean" ? (v ? "sim" : "não") : v
                          }`;
                        })
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {!item.ativo && <Badge variant="secondary">inativo</Badge>}
                  <button
                    type="button"
                    onClick={() => editar(item)}
                    className="text-xs text-primary hover:underline"
                  >
                    editar
                  </button>
                  <button
                    type="button"
                    onClick={() => remover(item)}
                    disabled={pending}
                    className="text-xs text-destructive/70 hover:text-destructive"
                  >
                    excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="surface p-4">
        <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          {editandoId ? "Editar item" : "Novo item"}
        </p>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label>Nome *</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          {campos.map((c) => (
            <div key={c.chave} className="grid gap-1">
              <Label>{c.rotulo}</Label>
              {c.tipo === "booleano" ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(dados[c.chave])}
                    onChange={(e) =>
                      setDados({ ...dados, [c.chave]: e.target.checked })
                    }
                    className="size-4"
                  />
                  {c.rotulo}
                </label>
              ) : (
                <Input
                  type={
                    c.tipo === "numero"
                      ? "number"
                      : c.tipo === "data"
                        ? "date"
                        : "text"
                  }
                  value={(dados[c.chave] as string) ?? ""}
                  onChange={(e) =>
                    setDados({ ...dados, [c.chave]: e.target.value })
                  }
                />
              )}
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="size-4"
            />
            Ativo
          </label>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <div className="flex gap-2">
            {editandoId && (
              <Button type="button" variant="ghost" onClick={limpar}>
                Cancelar
              </Button>
            )}
            <Button
              type="button"
              onClick={salvar}
              disabled={pending}
              className="flex-1"
            >
              {pending
                ? "Salvando..."
                : editandoId
                  ? "Salvar alterações"
                  : "＋ Adicionar"}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
