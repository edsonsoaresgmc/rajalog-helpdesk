"use client";

import { useRef, useState } from "react";
import type { NoInput } from "../actions";

const TIPO_ICONE: Record<NoInput["tipo"], string> = {
  inicio: "🚀",
  mensagem: "💬",
  menu_opcoes: "📋",
  pergunta_aberta: "✍️",
  condicional: "⇢",
  abrir_chamado: "🎫",
  encaminhar_humano: "🆘",
  fim: "🏁",
};

const TIPO_ROTULO: Record<NoInput["tipo"], string> = {
  inicio: "Início",
  mensagem: "Mensagem",
  menu_opcoes: "Menu de opções",
  pergunta_aberta: "Pergunta aberta",
  condicional: "Condicional",
  abrir_chamado: "Abrir chamado",
  encaminhar_humano: "Encaminhar humano",
  fim: "Fim",
};

const AUTO_SEQUENCIAL: NoInput["tipo"][] = [
  "inicio",
  "mensagem",
  "pergunta_aberta",
  "abrir_chamado",
  "encaminhar_humano",
];

const NODE_W = 220;
const NODE_H = 76;

type Edge = {
  fromCodigo: string;
  toCodigo: string;
  label?: string;
  kind: "seq" | "opcao" | "padrao";
};

function computeEdges(nos: NoInput[]): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < nos.length; i++) {
    const n = nos[i];
    if (n.tipo === "fim") continue;

    if (n.tipo === "menu_opcoes" || n.tipo === "condicional") {
      for (const o of n.opcoes ?? []) {
        if (!o.destino_codigo) continue;
        edges.push({
          fromCodigo: n.codigo,
          toCodigo: o.destino_codigo,
          label: o.rotulo || o.valor,
          kind: "opcao",
        });
      }
      if (n.destino_padrao_codigo) {
        edges.push({
          fromCodigo: n.codigo,
          toCodigo: n.destino_padrao_codigo,
          label: "senão",
          kind: "padrao",
        });
      }
    } else if (AUTO_SEQUENCIAL.includes(n.tipo) && i < nos.length - 1) {
      edges.push({
        fromCodigo: n.codigo,
        toCodigo: nos[i + 1].codigo,
        kind: "seq",
      });
    }
  }
  return edges;
}

const KIND_COLOR: Record<Edge["kind"], string> = {
  seq: "var(--muted-foreground)",
  opcao: "#10b981",
  padrao: "#ef4444",
};

interface Props {
  nos: NoInput[];
  selecionado: number | null;
  onSelecionar: (idx: number) => void;
  onMoverPosicao: (idx: number, x: number, y: number) => void;
  onMover: (idx: number, dir: -1 | 1) => void;
  onRemover: (idx: number) => void;
}

export function CanvasFluxo({
  nos,
  selecionado,
  onSelecionar,
  onMoverPosicao,
  onMover,
  onRemover,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [arrastando, setArrastando] = useState<{
    idx: number;
    offsetX: number;
    offsetY: number;
    moveu: boolean;
  } | null>(null);

  const edges = computeEdges(nos);
  const porCodigo = new Map(nos.map((n, idx) => [n.codigo, { n, idx }]));

  const maxX = Math.max(800, ...nos.map((n) => (n.posicao?.x ?? 0) + NODE_W + 60));
  const maxY = Math.max(500, ...nos.map((n) => (n.posicao?.y ?? 0) + NODE_H + 60));

  function handlePointerDown(e: React.PointerEvent, idx: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const n = nos[idx];
    const px = e.clientX - rect.left + containerRef.current!.scrollLeft;
    const py = e.clientY - rect.top + containerRef.current!.scrollTop;
    setArrastando({
      idx,
      offsetX: px - (n.posicao?.x ?? 0),
      offsetY: py - (n.posicao?.y ?? 0),
      moveu: false,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!arrastando) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left + containerRef.current!.scrollLeft;
    const py = e.clientY - rect.top + containerRef.current!.scrollTop;
    const x = Math.max(0, px - arrastando.offsetX);
    const y = Math.max(0, py - arrastando.offsetY);
    onMoverPosicao(arrastando.idx, x, y);
    if (!arrastando.moveu) setArrastando({ ...arrastando, moveu: true });
  }

  function handlePointerUp(idx: number) {
    if (arrastando && !arrastando.moveu) {
      onSelecionar(idx);
    }
    setArrastando(null);
  }

  return (
    <div
      ref={containerRef}
      className="surface relative h-[560px] overflow-auto"
      onPointerMove={handlePointerMove}
    >
      <div
        className="relative"
        style={{ width: maxX, height: maxY, minWidth: "100%", minHeight: "100%" }}
      >
        <svg
          className="pointer-events-none absolute inset-0"
          width={maxX}
          height={maxY}
        >
          <defs>
            <marker
              id="seta"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>
          {edges.map((edge, i) => {
            const origem = porCodigo.get(edge.fromCodigo);
            const destino = porCodigo.get(edge.toCodigo);
            if (!origem || !destino) return null;
            const ox = (origem.n.posicao?.x ?? 0) + NODE_W;
            const oy = (origem.n.posicao?.y ?? 0) + NODE_H / 2;
            const dx = destino.n.posicao?.x ?? 0;
            const dy = (destino.n.posicao?.y ?? 0) + NODE_H / 2;
            const midX = (ox + dx) / 2;
            const color = KIND_COLOR[edge.kind];
            return (
              <g key={i} color={color}>
                <path
                  d={`M ${ox} ${oy} C ${midX} ${oy}, ${midX} ${dy}, ${dx} ${dy}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  markerEnd="url(#seta)"
                  opacity={0.8}
                />
                {edge.label && (
                  <text
                    x={midX}
                    y={(oy + dy) / 2 - 6}
                    textAnchor="middle"
                    fontSize={10}
                    fill={color}
                    className="select-none"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {nos.map((n, idx) => {
          const x = n.posicao?.x ?? 40 + idx * 260;
          const y = n.posicao?.y ?? 40;
          const ativo = selecionado === idx;
          return (
            <div
              key={n.codigo || idx}
              className={`absolute cursor-grab select-none rounded-xl border bg-card shadow-sm transition-colors active:cursor-grabbing ${
                ativo ? "border-primary/60 ring-2 ring-primary/30" : "border-border/60"
              }`}
              style={{ left: x, top: y, width: NODE_W, minHeight: NODE_H }}
              onPointerDown={(e) => handlePointerDown(e, idx)}
              onPointerUp={() => handlePointerUp(idx)}
            >
              <div className="flex items-center justify-between gap-1 border-b border-border/50 px-2 py-1">
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <span className="text-sm leading-none">
                    {n.tipo === "inicio" ? "🚀" : TIPO_ICONE[n.tipo]}
                  </span>
                  {n.tipo === "inicio" ? "Início" : TIPO_ROTULO[n.tipo]}
                </span>
                <div
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onMover(idx, -1)}
                    className="hover:text-foreground"
                    aria-label="Mover para cima na ordem"
                    title="Mover para cima na ordem (afeta conexão sequencial)"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => onMover(idx, 1)}
                    className="hover:text-foreground"
                    aria-label="Mover para baixo na ordem"
                    title="Mover para baixo na ordem (afeta conexão sequencial)"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemover(idx)}
                    className="text-destructive/70 hover:text-destructive"
                    aria-label="Remover"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="px-2 py-1.5">
                <p className="truncate text-sm font-medium">{n.nome}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  <code>{n.codigo}</code>
                  {n.setor_destino ? ` · ${n.setor_destino}` : ""}
                  {n.prioridade ? ` · ${n.prioridade}` : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
