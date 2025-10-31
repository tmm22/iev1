"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Line, Image as KonvaImage, Transformer } from "react-konva";
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
  const [imageEls, setImageEls] = useState<Record<string, { el: HTMLImageElement; url: string }>>({});

  const activeTool = useEditorStore((s) => s.activeTool);
  const brushSize = useEditorStore((s) => s.toolProps.brushSize);
  const primaryColor = useEditorStore((s) => s.toolProps.primaryColor);
  const pendingUrl = useEditorStore((s) => s.pendingInsertAssetUrl);
  const clearPending = useEditorStore((s) => (s as any).clearPendingInsert as () => void);
  const addLayer = useEditorStore((s) => s.addLayer);
  const layers = useEditorStore((s) => s.layers);
  const setLayerTransform = useEditorStore((s) => (s as any).setLayerTransform as (id: string, patch: any) => void);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);

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
      const id = `${Date.now()}-${Math.random()}`;
      setImageEls((prev) => ({ ...prev, [id]: { el: img, url: pendingUrl } }));
      // create a matching layer entry with initial transform
      const x = size.width / 2 - img.width / 4;
      const y = size.height / 2 - img.height / 4;
      (addLayer as any)();
      // set the last added layer to image kind and transforms
      const last = (useEditorStore.getState().layers ?? []).slice(-1)[0];
      if (last) {
        useEditorStore.setState({
          layers: useEditorStore.getState().layers.map((l) =>
            l.id === last.id
              ? {
                  ...l,
                  kind: "image",
                  imageUrl: pendingUrl,
                  x,
                  y,
                  width: img.width,
                  height: img.height,
                  rotation: 0
                }
              : l
          ),
          selectedLayerId: last.id
        });
        window.dispatchEvent(new Event("canvas:changed"));
      }
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

  const endDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      window.dispatchEvent(new Event("canvas:changed"));
    }
  };

  // Export/import snapshot via window events
  useEffect(() => {
    const onRequest = () => {
      const snapshot = {
        version: 1,
        size,
        scale,
        position,
        lines,
        images: (layers || [])
          .filter((l: any) => l.kind === "image" && l.imageUrl)
          .map((l: any) => ({ url: l.imageUrl!, x: l.x ?? 0, y: l.y ?? 0, width: l.width, height: l.height, rotation: l.rotation ?? 0 }))
      };
      window.dispatchEvent(new CustomEvent("canvas:export", { detail: snapshot }));
    };
    const onImport = (e: Event) => {
      const snap = (e as CustomEvent).detail as any;
      setScale(snap.scale ?? 1);
      setPosition(snap.position ?? { x: 0, y: 0 });
      setLines(Array.isArray(snap.lines) ? snap.lines : []);
      // import images into layers and load elements
      const incoming = Array.isArray(snap.images) ? snap.images : [];
      incoming.forEach((it: any) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const id = `${Date.now()}-${Math.random()}`;
          setImageEls((prev) => ({ ...prev, [id]: { el: img, url: it.url } }));
          useEditorStore.setState((st) => ({
            layers: [
              ...st.layers,
              {
                id,
                name: `Image ${st.layers.length + 1}`,
                visible: true,
                opacity: 1,
                kind: "image",
                imageUrl: it.url,
                x: it.x ?? 0,
                y: it.y ?? 0,
                width: img.width,
                height: img.height,
                rotation: it.rotation ?? 0
              }
            ]
          }));
        };
        img.src = it.url;
      });
    };
    window.addEventListener("canvas:requestExport", onRequest);
    window.addEventListener("canvas:import", onImport as any);
    return () => {
      window.removeEventListener("canvas:requestExport", onRequest);
      window.removeEventListener("canvas:import", onImport as any);
    };
  }, [size, scale, position, lines, layers]);

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
          {layers
            .filter((l: any) => l.kind === "image" && l.imageUrl && imageEls[l.id])
            .map((l: any) => (
              <KonvaImage
                key={l.id}
                id={l.id}
                image={imageEls[l.id].el}
                x={l.x ?? 0}
                y={l.y ?? 0}
                width={l.width}
                height={l.height}
                rotation={l.rotation ?? 0}
                draggable
                onClick={(e) => {
                  selectLayer(l.id);
                  const node = e.target.getStage()?.findOne(`#${l.id}`);
                  if (node) node.getStage()?.batchDraw();
                  window.dispatchEvent(new CustomEvent("canvas:selection", { detail: { id: l.id, ...l } }));
                }}
                onDragEnd={(e) => {
                  const pos = e.target.position();
                  setLayerTransform(l.id, { x: pos.x, y: pos.y });
                  window.dispatchEvent(new Event("canvas:changed"));
                  window.dispatchEvent(new CustomEvent("canvas:selection", { detail: { id: l.id, ...l, x: pos.x, y: pos.y } }));
                }}
                onTransformEnd={(e) => {
                  const node = e.target as any;
                  const width = Math.max(1, node.width() * node.scaleX());
                  const height = Math.max(1, node.height() * node.scaleY());
                  const rotation = node.rotation();
                  node.scaleX(1);
                  node.scaleY(1);
                  setLayerTransform(l.id, { width, height, rotation });
                  window.dispatchEvent(new Event("canvas:changed"));
                  window.dispatchEvent(new CustomEvent("canvas:selection", { detail: { id: l.id, ...l, width, height, rotation } }));
                }}
                onTap={() => selectLayer(l.id)}
              />
            ))}
          {selectedLayerId ? (
            <Transformer
              nodes={(() => {
                const stage = stageRef.current;
                if (!stage) return [] as any[];
                const node = stage.findOne(`#${selectedLayerId}`);
                return node ? [node] : [];
              })()}
              rotateEnabled
              enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
              boundBoxFunc={(oldBox, newBox) => {
                // prevent resize too small
                if (newBox.width < 10 || newBox.height < 10) return oldBox;
                return newBox;
              }}
            />
          ) : null}
        </Layer>
      </Stage>

      {/* HUD */}
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-slate-800 bg-slate-900/80 px-2 py-1 text-[11px] text-slate-300">
        {spaceDown ? "Pan (Space)" : activeTool === "brush" ? "Brush" : activeTool === "eraser" ? "Eraser" : selectedLayerId ? "Select" : "Navigate"}
        {"  ·  "}Zoom: wheel  ·  Brush size: {brushSize}
      </div>
    </div>
  );
}
