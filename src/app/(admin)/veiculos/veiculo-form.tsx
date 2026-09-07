"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { VeiculoState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const inicial: VeiculoState = { error: null };

export type VeiculoValores = {
  placa: string;
  frota: string | null;
  tipo: string | null;
  marca: string | null;
  modelo: string | null;
  ano: number | null;
  status: string | null;
};

export function VeiculoForm({
  action,
  valores,
  submitLabel,
}: {
  action: (prev: VeiculoState, formData: FormData) => Promise<VeiculoState>;
  valores?: VeiculoValores;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, inicial);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-1">
        <Label htmlFor="placa">Placa *</Label>
        <Input
          id="placa"
          name="placa"
          required
          className="font-mono uppercase"
          defaultValue={valores?.placa}
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="frota">Frota</Label>
        <Input id="frota" name="frota" defaultValue={valores?.frota ?? ""} />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="tipo">Tipo</Label>
        <Input id="tipo" name="tipo" defaultValue={valores?.tipo ?? ""} />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="marca">Marca</Label>
        <Input id="marca" name="marca" defaultValue={valores?.marca ?? ""} />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="modelo">Modelo</Label>
        <Input id="modelo" name="modelo" defaultValue={valores?.modelo ?? ""} />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="ano">Ano</Label>
        <Input
          id="ano"
          name="ano"
          type="number"
          defaultValue={valores?.ano ?? ""}
        />
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
          render={<Link href="/veiculos" />}
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
