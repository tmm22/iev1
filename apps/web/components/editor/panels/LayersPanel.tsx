"use client";

import { useEditorStore } from "@/lib/state/editorStore";
import { PlusIcon, TrashIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export function LayersPanel() {
  const layers = useEditorStore((s) => s.layers);
  const selected = useEditorStore((s) => s.selectedLayerId);
  const selectedIds = useEditorStore((s) => (s as any).selectedLayerIds as string[]);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const toggleSelect = useEditorStore((s) => (s as any).toggleSelectLayer as (id: string) => void);
  const addLayer = useEditorStore((s) => s.addLayer);
  const removeLayer = useEditorStore((s) => s.removeLayer);
  const toggleVis = useEditorStore((s) => s.toggleLayerVisibility);
  const moveLayer = useEditorStore((s) => s.moveLayer);
  const groupSelection = useEditorStore((s) => (s as any).groupSelection as () => void);
  const ungroupSelection = useEditorStore((s) => (s as any).ungroupSelection as () => void);

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, fromIndex: number) => {
    e.dataTransfer.setData("text/layer-index", String(fromIndex));
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, toIndex: number) => {
    e.preventDefault();
    const fromIndexStr = e.dataTransfer.getData("text/layer-index");
    const fromIndex = Number(fromIndexStr);
    if (Number.isFinite(fromIndex)) {
      moveLayer(fromIndex, toIndex);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-900 bg-slate-950/70 p-4">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-200">Layers</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => groupSelection()}
            disabled={!selectedIds || selectedIds.length < 2}
            className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-200 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-800"
          >
            Group
          </button>
          <button
            type="button"
            onClick={() => ungroupSelection()}
            disabled={!selectedIds || selectedIds.length === 0}
            className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-200 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-800"
          >
            Ungroup
          </button>
          <button
            type="button"
            onClick={() => addLayer()}
            className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
          >
            <PlusIcon className="h-4 w-4" /> Add
          </button>
        </div>
      </header>
      <div className="flex flex-col gap-2">
        {layers.length === 0 ? (
          <p className="text-xs text-slate-500">No layers</p>
        ) : (
          layers.map((layer, idx) => (
            <div
              key={layer.id}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey) toggleSelect(layer.id);
                else selectLayer(layer.id);
              }}
              draggable
              onDragStart={(e) => onDragStart(e, idx)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, idx)}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                selected === layer.id || (selectedIds && selectedIds.includes(layer.id))
                  ? "border-brand/60 bg-brand/10 text-slate-100"
                  : "border-slate-900/60 bg-slate-900/50 text-slate-300 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVis(layer.id);
                  }}
                  className="rounded-md border border-slate-800 bg-slate-900 p-1 text-slate-300 hover:bg-slate-800"
                  aria-label={layer.visible ? "Hide layer" : "Show layer"}
                >
                  {layer.visible ? (
                    <EyeIcon className="h-4 w-4" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4" />
                  )}
                </button>
                <span className="truncate">{layer.name}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeLayer(layer.id);
                }}
                className="rounded-md border border-slate-800 bg-slate-900 p-1 text-slate-300 hover:bg-slate-800"
                aria-label="Delete layer"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
