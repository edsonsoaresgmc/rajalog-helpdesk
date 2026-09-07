"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { MotoristaState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const inicial: MotoristaState = { error: null };

export type MotoristaValores = {
  matricula: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  cnh: string | null;
  cargo: string | null;
  base: string | null;
  status: string | null;
};

export function MotoristaForm({
  action,
  valores,
  filiais,
  submitLabel,
}: {
  action: (
    prev: MotoristaState,
    formData: FormData
  ) => Promise<MotoristaState>;
  valores?: MotoristaValores;
  filiais: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, inicial);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-1">
        <Label htmlFor="matricula">Matrícula *</Label>
        <Input
          id="matricula"
          name="matricula"
          required
          defaultValue={valores?.matricula}
          className="font-mono"
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" name="nome" required defaultValue={valores?.nome} />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="cpf">CPF</Label>
        <Input id="cpf" name="cpf" defaultValue={valores?.cpf ?? ""} />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="telefone">Telefone (WhatsApp)</Label>
        <Input
          id="telefone"
          name="telefone"
          placeholder="+55..."
          defaultValue={valores?.telefone ?? ""}
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="cnh">CNH</Label>
        <Input id="cnh" name="cnh" defaultValue={valores?.cnh ?? ""} />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="cargo">Cargo</Label>
        <Input
          id="cargo"
          name="cargo"
          placeholder="Motorista Carreteiro"
          defaultValue={valores?.cargo ?? ""}
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="base">Base / Filial</Label>
        <Input
          id="base"
          name="base"
          list="filiais-lista"
          defaultValue={valores?.base ?? ""}
        />
        <datalist id="filiais-lista">
          {filiais.map((f) => (
            <option key={f} value={f} />
          ))}
        </datalist>
      </div>
      <div className="grid gap-1">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={valores?.status ?? "ativo"}
          className="h-9 rounded-md border border-border/70 bg-background px-3 text-sm"
        >
          <option value="ativo">ativo</option>
          <option value="inativo">inativo</option>
        </select>
      </div>
      {state.error && (
        <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>
      )}
      <div className="sm:col-span-2 flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          nativeButton={false}
          render={<Link href="/motoristas" />}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
