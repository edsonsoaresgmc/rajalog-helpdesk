"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { criarCatalogo, type CriarCatalogoState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inicial: CriarCatalogoState = { error: null };

type CampoRascunho = { chave: string; rotulo: string; tipo: string };

export function NovoCatalogoForm() {
  const [state, action, pending] = useActionState(criarCatalogo, inicial);
  const [campos, setCampos] = useState<CampoRascunho[]>([]);

  function addCampo() {
    setCampos([...campos, { chave: "", rotulo: "", tipo: "texto" }]);
  }

  function atualizarCampo(idx: number, patch: Partial<CampoRascunho>) {
    setCampos(campos.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  function removerCampo(idx: number) {
    setCampos(campos.filter((_, i) => i !== idx));
  }

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-1 sm:col-span-2">
        <Label htmlFor="nome">Nome do catálogo *</Label>
        <Input id="nome" name="nome" required placeholder="Ex.: Filiais" />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="codigo">
          Código *{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (identificador único, minúsculo)
          </span>
        </Label>
        <Input
          id="codigo"
          name="codigo"
          required
          maxLength={40}
          pattern="[a-z][a-z0-9_]{1,39}"
          placeholder="Ex.: filiais"
          className="font-mono"
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="icone">Ícone (emoji)</Label>
        <Input id="icone" name="icone" maxLength={4} placeholder="📋" />
      </div>
      <div className="grid gap-1 sm:col-span-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" name="descricao" rows={2} />
      </div>

      <div className="grid gap-2 sm:col-span-2">
        <div className="flex items-center justify-between">
          <Label>Campos extras de cada item</Label>
          <Button type="button" variant="outline" size="sm" onClick={addCampo}>
            ＋ campo
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Todo item já tem um nome. Adicione campos extras se precisar de
          mais informação (ex.: telefone, cidade, setor).
        </p>
        {campos.map((c, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[1fr_1fr_100px_auto] items-end gap-2 rounded-md border border-border/60 p-2"
          >
            <div className="grid gap-1">
              <Label className="text-xs">Chave</Label>
              <Input
                name="campo_chave"
                value={c.chave}
                onChange={(e) => atualizarCampo(idx, { chave: e.target.value })}
                className="font-mono text-xs"
                placeholder="telefone"
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Rótulo</Label>
              <Input
                name="campo_rotulo"
                value={c.rotulo}
                onChange={(e) => atualizarCampo(idx, { rotulo: e.target.value })}
                placeholder="Telefone"
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Tipo</Label>
              <select
                name="campo_tipo"
                value={c.tipo}
                onChange={(e) => atualizarCampo(idx, { tipo: e.target.value })}
                className="h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
              >
                <option value="texto">texto</option>
                <option value="numero">número</option>
                <option value="data">data</option>
                <option value="booleano">sim/não</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => removerCampo(idx)}
              className="mb-1.5 text-destructive/70 hover:text-destructive"
              aria-label="Remover campo"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {state.error && (
        <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>
      )}
      <div className="sm:col-span-2 flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          nativeButton={false}
          render={<Link href="/cadastros" />}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Criando..." : "Criar catálogo →"}
        </Button>
      </div>
    </form>
  );
}
