"use client";

import Image from "next/image";
import { useEditorStore } from "@/lib/state/editorStore";

export function AssetsPanel() {
  const assets = useEditorStore((s) => s.assets);
  const queue = useEditorStore((s) => s.queueInsertAssetUrl as (url: string) => void);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-900 bg-slate-950/70 p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Assets</h2>
        <span className="text-xs text-slate-500">Uploads & AI</span>
      </header>
      <div className="grid grid-cols-3 gap-2">
        {assets.length === 0 ? (
          <p className="col-span-3 text-xs text-slate-500">No assets yet.</p>
        ) : (
          assets.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => queue(a.url)}
              className="group relative aspect-square overflow-hidden rounded-md border border-slate-900/60 bg-slate-900/50"
              title={`Insert ${a.name}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.url}
                alt={a.name}
                className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
                draggable={false}
              />
              <span className="pointer-events-none absolute bottom-0 left-0 right-0 truncate bg-black/40 px-1 py-0.5 text-[10px] text-slate-100">
                {a.name}
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
