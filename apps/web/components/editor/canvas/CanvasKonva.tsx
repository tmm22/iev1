"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import type Konva from "konva";
import { useEditorStore } from "@/lib/state/editorStore";

type DrawLine = {
  tool: "brush" | "eraser";
  points: number[];
  color: string;
  size: number;
};

export function CanvasKonva() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [size, setSize] = useState({ width: 960, height: 540 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [spaceDown, setSpaceDown] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState<DrawLine[]>([]);
  const [images, setImages] = useState<Array<{ id: string; el: HTMLImageElement; x: number; y: number }>>([]);

  const activeTool = useEditorStore((s) => s.activeTool);
  const brushSize = useEditorStore((s) => s.toolProps.brushSize);
  const primaryColor = useEditorStore((s) => s.toolProps.primaryColor);
  const pendingUrl = useEditorStore((s) => s.pendingInsertAssetUrl);
  const clearPending = useEditorStore((s) => (s as any).clearPendingInsert as () => void);

  // Fit to container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setSize({ width: Math.max(320, rect.width), height: Math.max(240, rect.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Track space key for panning
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setSpaceDown(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setSpaceDown(false);
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Keyboard zoom controls via custom events from shell
  useEffect(() => {
    const onZoom = (e: Event) => {
      const detail = (e as CustomEvent).detail as { type: "in" | "out" };
      const factor = 1.1;
      setScale((s) => (detail.type === "in" ? s * factor : s / factor));
    };
    const onFit = () => {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    };
    window.addEventListener("canvas:zoom", onZoom as any);
    window.addEventListener("canvas:zoom:fit", onFit);
    return () => {
      window.removeEventListener("canvas:zoom", onZoom as any);
      window.removeEventListener("canvas:zoom:fit", onFit);
    };
  }, []);

  // Insert asset by URL when signaled by store
  useEffect(() => {
    if (!pendingUrl) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImages((prev) => [
        ...prev,
        { id: `${Date.now()}-${Math.random()}`, el: img, x: size.width / 2 - img.width / 4, y: size.height / 2 - img.height / 4 }
      ]);
      clearPending();
    };
    img.onerror = () => clearPending();
    img.src = pendingUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingUrl]);

  const onWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const scaleBy = 1.05;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale
    };
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    };
    setScale(newScale);
    setPosition(newPos);
  };

  const startDraw = () => {
    if (spaceDown) return;
    if (activeTool !== "brush" && activeTool !== "eraser") return;
    const stage = stageRef.current;
    if (!stage) return;
    const p = stage.getPointerPosition();
    if (!p) return;
    const line: DrawLine = {
      tool: activeTool,
      points: [p.x, p.y],
      color: primaryColor,
      size: brushSize
    };
    setLines((prev) => [...prev, line]);
    setIsDrawing(true);
  };

  const moveDraw = () => {
    if (!isDrawing) return;
    const stage = stageRef.current;
    if (!stage) return;
    const p = stage.getPointerPosition();
    if (!p) return;
    setLines((prev) => {
      const next = prev.slice();
      const last = next[next.length - 1];
      if (!last) return next;
      last.points = last.points.concat([p.x, p.y]);
      return next;
    });
  };

  const endDraw = () => setIsDrawing(false);

  return (
    <div ref={containerRef} className="relative flex h-full w-full select-none items-stretch justify-stretch">
      <Stage
        ref={stageRef as any}
        width={size.width}
        height={size.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable={spaceDown}
        onDragEnd={(e) => setPosition(e.target.position())}
        onWheel={onWheel}
        onMouseDown={startDraw}
        onMousemove={moveDraw}
        onMouseup={endDraw}
        className="rounded-2xl bg-slate-950/90"
      >
        {/* Background layer */}
        <Layer listening={false}>
          {/* simple border frame */}
          {/* Using Konva shapes would require Rect; we keep drawing area clean */}
        </Layer>

        {/* Draw layer */}
        <Layer>
          {lines.map((l, i) => (
            <Line
              key={i}
              points={l.points}
              stroke={l.tool === "eraser" ? "#000" : l.color}
              strokeWidth={Math.max(1, l.size)}
              tension={0}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={l.tool === "eraser" ? ("destination-out" as any) : undefined}
            />
          ))}
          {images.map((it) => (
            <KonvaImage key={it.id} image={it.el} x={it.x} y={it.y} draggable />
          ))}
        </Layer>
      </Stage>

      {/* HUD */}
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-slate-800 bg-slate-900/80 px-2 py-1 text-[11px] text-slate-300">
        {spaceDown ? "Pan (Space)" : activeTool === "brush" ? "Brush" : activeTool === "eraser" ? "Eraser" : "Navigate"}
        {"  ·  "}Zoom: wheel  ·  Brush size: {brushSize}
      </div>
    </div>
  );
}
