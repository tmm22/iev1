"use client";

import { useEffect, useRef } from "react";

export function CanvasPlaceholder() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const { width, height } = canvas;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#1f2937");
    gradient.addColorStop(1, "#111827");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    ctx.fillStyle = "#e0e7ff";
    ctx.font = "24px Inter, sans-serif";
    ctx.fillText("Canvas placeholder", 60, 120);

    ctx.font = "16px Inter, sans-serif";
    ctx.fillStyle = "#cbd5f5";
    ctx.fillText("Phase 0 – Hook in future rendering engine here.", 60, 160);
  }, []);

  return (
    <div className="relative flex flex-1 items-center justify-center bg-slate-950/60">
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="h-full max-h-full w-full max-w-full rounded-2xl bg-slate-950/90 shadow-lg ring-1 ring-black/[0.08]"
      />
      <div className="pointer-events-none absolute bottom-6 right-6 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs text-brand">
        Mock renderer
      </div>
    </div>
  );
}
