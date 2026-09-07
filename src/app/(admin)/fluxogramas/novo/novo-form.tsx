"use client";

import Link from "next/link";
import { useActionState } from "react";
import { criarFluxo, type CriarFluxoState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inicial: CriarFluxoState = { error: null };

export function NovoFluxoForm() {
  const [state, action, pending] = useActionState(criarFluxo, inicial);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-1 sm:col-span-2">
        <Label htmlFor="nome">Nome do fluxo *</Label>
        <Input
          id="nome"
          name="nome"
          required
          placeholder="Ex.: Comunicar Sinistro"
        />
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
          placeholder="Ex.: sinistro"
          className="font-mono"
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="icone">Ícone (emoji)</Label>
        <Input id="icone" name="icone" maxLength={4} placeholder="🚨" />
      </div>
      <div className="grid gap-1 sm:col-span-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" name="descricao" rows={2} />
      </div>
      <div className="grid gap-1 sm:col-span-2">
        <Label htmlFor="gatilho_palavras">
          Palavras-gatilho{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (separadas por vírgula — disparam o fluxo mesmo fora do menu)
          </span>
        </Label>
        <Input
          id="gatilho_palavras"
          name="gatilho_palavras"
          placeholder="Ex.: acidente, batida, colisão, capotou, vazamento"
        />
      </div>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="prioridade_seguranca" className="size-4" />
        Fluxo de segurança — interrompe qualquer outro fluxo em andamento
        (ex.: Sinistro, SSMA com lesão)
      </label>
      {state.error && (
        <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>
      )}
      <div className="sm:col-span-2 flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          nativeButton={false}
          render={<Link href="/fluxogramas" />}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Criando..." : "Criar e continuar →"}
        </Button>
      </div>
    </form>
  );
}
