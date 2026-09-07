"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { excluirVeiculo } from "../actions";

export function ExcluirVeiculo({
  veiculoId,
  placa,
}: {
  veiculoId: string;
  placa: string;
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
            `Excluir o veículo "${placa}"?\n\nOs documentos enviados para ele continuarão no Storage, mas perderão o vínculo.`
          )
        )
          return;
        startTransition(async () => {
          const res = await excluirVeiculo(veiculoId);
          if (res.ok) {
            toast.success("Veículo excluído");
            router.push("/veiculos");
          } else {
            toast.error(res.error ?? "Não foi possível excluir");
          }
        });
      }}
    >
      🗑 Excluir veículo
    </Button>
  );
}
