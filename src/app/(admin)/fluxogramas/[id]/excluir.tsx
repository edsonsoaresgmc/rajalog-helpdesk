"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { excluirFluxo } from "../actions";

export function ExcluirFluxo({
  fluxoId,
  nome,
}: {
  fluxoId: string;
  nome: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={() => {
        if (!confirm(`Excluir o fluxo "${nome}"?\n\nSerá arquivado.`)) return;
        startTransition(async () => {
          const res = await excluirFluxo(fluxoId);
          if (res.ok) {
            toast.success("Fluxo excluído");
            router.push("/fluxogramas");
          } else {
            toast.error(res.error ?? "Não foi possível excluir");
          }
        });
      }}
    >
      🗑 Excluir fluxo
    </Button>
  );
}
