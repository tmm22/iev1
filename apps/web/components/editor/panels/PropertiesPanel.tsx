"use client";

import { useEditorStore } from "@/lib/state/editorStore";

export function PropertiesPanel() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const selectedLayerIds = useEditorStore((s) => (s as any).selectedLayerIds as string[]);
  const layer = useEditorStore((s) =>
    s.layers.find((l) => l.id === s.selectedLayerId) ?? null
  );
  const setOpacity = useEditorStore((s) => s.setLayerOpacity);
  const rename = useEditorStore((s) => s.renameLayer);
  const setLayerTransform = useEditorStore((s) => (s as any).setLayerTransform as (id: string, patch: any) => void);
  const brushSize = useEditorStore((s) => s.toolProps.brushSize);
  const setBrushSize = useEditorStore((s) => s.setBrushSize);
  const primaryColor = useEditorStore((s) => s.toolProps.primaryColor);
  const setPrimaryColor = useEditorStore((s) => s.setPrimaryColor);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-900 bg-slate-950/70 p-4">
      <header>
        <h2 className="text-sm font-semibold text-slate-200">Properties</h2>
        <p className="text-xs text-slate-500">Contextual controls</p>
      </header>

      {/* Tool properties */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-slate-300">Tool</h3>
        {activeTool === "brush" ? (
          <div className="flex flex-col gap-2">
            <label className="flex items-center justify-between text-xs text-slate-300">
              Brush size
              <input
                type="range"
                min={1}
                max={256}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
              />
            </label>
            <label className="flex items-center justify-between text-xs text-slate-300">
              Color
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
            </label>
          </div>
        ) : (
          <p className="text-xs text-slate-500">No tool-specific settings.</p>
        )}
      </div>

      {/* Layer properties */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-slate-300">Layer</h3>
        {selectedLayerIds && selectedLayerIds.length > 1 ? (
          <p className="text-xs text-slate-500">{selectedLayerIds.length} layers selected.</p>
        ) : !selectedLayerId || !layer ? (
          <p className="text-xs text-slate-500">No layer selected.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-xs text-slate-300">
              Name
              <input
                className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-sm text-slate-200 outline-none focus:border-brand/60"
                value={layer.name}
                onChange={(e) => rename(layer.id, e.target.value)}
              />
            </label>
            <label className="flex items-center justify-between text-xs text-slate-300">
              Opacity
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={layer.opacity}
                onChange={(e) => setOpacity(layer.id, Number(e.target.value))}
              />
            </label>
            {(typeof layer.x === "number" || typeof layer.y === "number") && (
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs text-slate-300">
                  X
                  <input
                    type="number"
                    className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-sm text-slate-200 outline-none focus:border-brand/60"
                    value={layer.x ?? 0}
                    onChange={(e) => setLayerTransform(layer.id, { x: Number(e.target.value) })}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-300">
                  Y
                  <input
                    type="number"
                    className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-sm text-slate-200 outline-none focus:border-brand/60"
                    value={layer.y ?? 0}
                    onChange={(e) => setLayerTransform(layer.id, { y: Number(e.target.value) })}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-300">
                  W
                  <input
                    type="number"
                    className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-sm text-slate-200 outline-none focus:border-brand/60"
                    value={layer.width ?? 0}
                    onChange={(e) => setLayerTransform(layer.id, { width: Math.max(1, Number(e.target.value)) })}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-300">
                  H
                  <input
                    type="number"
                    className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-sm text-slate-200 outline-none focus:border-brand/60"
                    value={layer.height ?? 0}
                    onChange={(e) => setLayerTransform(layer.id, { height: Math.max(1, Number(e.target.value)) })}
                  />
                </label>
                <label className="col-span-2 flex flex-col gap-1 text-xs text-slate-300">
                  Rotation
                  <input
                    type="number"
                    className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-sm text-slate-200 outline-none focus:border-brand/60"
                    value={layer.rotation ?? 0}
                    onChange={(e) => setLayerTransform(layer.id, { rotation: Number(e.target.value) })}
                  />
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
