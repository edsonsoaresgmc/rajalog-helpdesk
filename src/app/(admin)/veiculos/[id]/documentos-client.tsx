"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  uploadDocumento,
  excluirDocumento,
  urlAssinada,
  type UploadState,
} from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Documento = {
  id: string;
  tipo: string;
  arquivo_url: string;
  data_validade: string | null;
  status: string | null;
};

const inicial: UploadState = { error: null };

export function DocumentosClient({
  veiculoId,
  documentosIniciais,
  tiposDocumento,
}: {
  veiculoId: string;
  documentosIniciais: Documento[];
  tiposDocumento: string[];
}) {
  const router = useRouter();
  const acao = uploadDocumento.bind(null, veiculoId);
  const [state, formAction, pending] = useActionState(acao, inicial);
  const [excluindoPending, startExcluir] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Documento enviado");
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  async function verArquivo(path: string) {
    const url = await urlAssinada(path);
    if (url) window.open(url, "_blank");
    else toast.error("Não foi possível gerar o link do arquivo.");
  }

  function excluir(documentoId: string, path: string, tipo: string) {
    if (!confirm(`Excluir o documento "${tipo}"?`)) return;
    startExcluir(async () => {
      const res = await excluirDocumento(veiculoId, documentoId, path);
      if (res.ok) {
        toast.success("Documento excluído");
        router.refresh();
      } else {
        toast.error(res.error ?? "Falha ao excluir");
      }
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="surface p-4">
        <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          Documentos cadastrados
        </p>
        {documentosIniciais.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum documento enviado ainda.
          </p>
        ) : (
          <ul className="grid gap-2">
            {documentosIniciais.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">{d.tipo}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.data_validade ? `validade ${d.data_validade}` : "sem validade"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge
                    className={
                      d.status === "vencido"
                        ? "bg-red-500/12 text-red-700 dark:text-red-400"
                        : "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
                    }
                  >
                    {d.status ?? "—"}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => verArquivo(d.arquivo_url)}
                    className="text-xs text-primary hover:underline"
                  >
                    ver
                  </button>
                  <button
                    type="button"
                    onClick={() => excluir(d.id, d.arquivo_url, d.tipo)}
                    disabled={excluindoPending}
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
          Enviar novo documento
        </p>
        <form ref={formRef} action={formAction} className="grid gap-3">
          <div className="grid gap-1">
            <Label htmlFor="tipo">Tipo *</Label>
            <select
              id="tipo"
              name="tipo"
              required
              defaultValue=""
              className="h-9 rounded-md border border-border/70 bg-background px-3 text-sm"
            >
              <option value="" disabled>
                Selecione...
              </option>
              {tiposDocumento.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="data_validade">Data de validade</Label>
            <Input id="data_validade" name="data_validade" type="date" />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="arquivo">Arquivo *</Label>
            <input
              id="arquivo"
              name="arquivo"
              type="file"
              required
              accept="application/pdf,image/*"
              className="text-sm"
            />
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Enviando..." : "Enviar documento"}
          </Button>
        </form>
      </aside>
    </div>
  );
}
