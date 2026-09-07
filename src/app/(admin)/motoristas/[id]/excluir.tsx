"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { excluirMotorista } from "../actions";

export function ExcluirMotorista({
  motoristaId,
  nome,
}: {
  motoristaId: string;
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
        if (!confirm(`Excluir o motorista "${nome}"?`)) return;
        startTransition(async () => {
          const res = await excluirMotorista(motoristaId);
          if (res.ok) {
            toast.success("Motorista excluído");
            router.push("/motoristas");
          } else {
            toast.error(res.error ?? "Não foi possível excluir");
          }
        });
      }}
    >
      🗑 Excluir
    </Button>
  );
}
