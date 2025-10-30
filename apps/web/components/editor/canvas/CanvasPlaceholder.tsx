"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/lib/state/editorStore";

export function CanvasPlaceholder() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeTool = useEditorStore((s) => s.activeTool);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const layer = useEditorStore((s) =>
    s.layers.find((l) => l.id === s.selectedLayerId) ?? null
  );
  const brushSize = useEditorStore((s) => s.toolProps.brushSize);
  const primaryColor = useEditorStore((s) => s.toolProps.primaryColor);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#1f2937");
    gradient.addColorStop(1, "#111827");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Framing
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Phase 1 title
    ctx.fillStyle = "#e0e7ff";
    ctx.font = "24px Inter, sans-serif";
    ctx.fillText("Canvas (Phase 1 scaffold)", 60, 120);

    // Context info
    ctx.font = "16px Inter, sans-serif";
    ctx.fillStyle = "#cbd5f5";
    const layerLabel = layer ? `${layer.name}${layer.visible ? "" : " (hidden)"}` : "None";
    ctx.fillText(`Active tool: ${activeTool}  ·  Selected layer: ${layerLabel}`, 60, 160);

    // Visualize tool props (e.g., brush preview circle)
    const alpha = layer ? Math.max(0.1, Math.min(1, layer.opacity)) : 1;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = primaryColor;
    const cx = width - 140;
    const cy = 120;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(6, Math.min(48, brushSize / 2)), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Preview: tool size/color and layer opacity", cx - 140, cy + 40);
  }, [activeTool, layer, brushSize, primaryColor]);

  return (
    <div className="relative flex flex-1 items-center justify-center bg-slate-950/60">
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="h-full max-h-full w-full max-w-full rounded-2xl bg-slate-950/90 shadow-lg ring-1 ring-black/[0.08]"
      />
      <div className="pointer-events-none absolute bottom-6 right-6 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs text-brand">
        Phase 1 shell
      </div>
    </div>
  );
}
