"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { excluirCatalogo } from "../actions";

export function ExcluirCatalogo({
  catalogoId,
  nome,
}: {
  catalogoId: string;
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
        if (
          !confirm(
            `Excluir o catálogo "${nome}"?\n\nTodos os itens dele também serão removidos.`
          )
        )
          return;
        startTransition(async () => {
          const res = await excluirCatalogo(catalogoId);
          if (res.ok) {
            toast.success("Catálogo excluído");
            router.push("/cadastros");
          } else {
            toast.error(res.error ?? "Não foi possível excluir");
          }
        });
      }}
    >
      🗑 Excluir catálogo
    </Button>
  );
}
