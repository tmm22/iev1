"use client";

import { useEditorStore } from "@/lib/state/editorStore";
import { PlusIcon, TrashIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export function LayersPanel() {
  const layers = useEditorStore((s) => s.layers);
  const selected = useEditorStore((s) => s.selectedLayerId);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const addLayer = useEditorStore((s) => s.addLayer);
  const removeLayer = useEditorStore((s) => s.removeLayer);
  const toggleVis = useEditorStore((s) => s.toggleLayerVisibility);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-900 bg-slate-950/70 p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Layers</h2>
        <button
          type="button"
          onClick={() => addLayer()}
          className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
        >
          <PlusIcon className="h-4 w-4" /> Add
        </button>
      </header>
      <div className="flex flex-col gap-2">
        {layers.length === 0 ? (
          <p className="text-xs text-slate-500">No layers</p>
        ) : (
          layers.map((layer) => (
            <div
              key={layer.id}
              onClick={() => selectLayer(layer.id)}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                selected === layer.id
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
