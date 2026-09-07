"use client";

import { useActionState } from "react";
import { signIn, type AuthState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <main className="grid min-h-svh place-items-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            🚛 Bot Raja Log
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Painel do administrador
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acesso restrito aos administradores do Help Desk dos motoristas.
          </p>
        </div>
        <form action={formAction} className="surface grid gap-4 p-6">
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@rajalog.com.br"
              autoComplete="email"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {state.error && (
            <p
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {state.error}
            </p>
          )}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Precisa de acesso? Fale com quem administra o bot.
        </p>
      </div>
    </main>
  );
}
