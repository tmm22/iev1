"use client";

import { useState, useRef, ChangeEvent } from "react";
import { DocumentArrowUpIcon } from "@heroicons/react/24/outline";
import { uploadResponseToAsset, mockUpload } from "@/lib/uploadthing/mockClient";
import { useEditorStore } from "@/lib/state/editorStore";

export function UploadPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const addAsset = useEditorStore((state) => state.addAsset);
  const [isUploading, setIsUploading] = useState(false);
  const assets = useEditorStore((state) =>
    state.assets.filter((asset) => asset.source === "upload")
  );

  const onSelectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      const response = await mockUpload({ file, slug: "editor-assets" });
      addAsset(uploadResponseToAsset(response, file.name));
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-900 bg-slate-950/70 p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Uploads</h2>
        <span className="text-xs text-slate-500">Mocked via UploadThing</span>
      </header>
      <p className="text-xs text-slate-400">
        Uploads are simulated. Replace this with the real UploadThing flow once
        credentials are provisioned.
      </p>
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-slate-800 bg-slate-900/60 p-4 text-center transition hover:border-brand/40 hover:bg-brand/5">
        <DocumentArrowUpIcon className="h-8 w-8 text-brand" aria-hidden="true" />
        <span className="text-xs font-medium text-slate-200">
          {isUploading ? "Uploading…" : "Select file"}
        </span>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={onSelectFile}
          disabled={isUploading}
        />
      </label>
      <div className="flex flex-col gap-2 text-xs text-slate-300">
        {assets.length === 0 ? (
          <p className="text-slate-500">No uploads yet.</p>
        ) : (
          assets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center justify-between rounded-lg border border-slate-900/60 bg-slate-900/50 px-3 py-2"
            >
              <span className="truncate text-slate-200">{asset.name}</span>
              <a
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                className="text-brand hover:underline"
              >
                Preview
              </a>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
