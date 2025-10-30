"use client";

import { FormEvent, useMemo, useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useEditorStore, type AiJob } from "@/lib/state/editorStore";

const PROVIDERS = [
  { label: "Auto (recommended)", value: "auto" },
  { label: "Gemini Image (Nano Banana)", value: "gemini" },
  { label: "OpenAI GPT Image", value: "openai" }
];

const SIZES = [
  { label: "512 × 512", value: "512" },
  { label: "768 × 768", value: "768" },
  { label: "1024 × 1024", value: "1024" },
  { label: "Custom…", value: "custom" }
];

const QUALITIES = [
  { label: "Standard", value: "standard" },
  { label: "High", value: "high" }
];

async function generateMockImageDataUrl(
  prompt: string,
  width: number,
  height: number,
  seed: number
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  // Background gradient seeded by prompt
  const grad = ctx.createLinearGradient(0, 0, width, height);
  const hue = Math.abs(
    [...prompt].reduce((acc, ch) => acc + ch.charCodeAt(0), seed * 137)
  ) % 360;
  grad.addColorStop(0, `hsl(${hue}, 70%, 12%)`);
  grad.addColorStop(1, `hsl(${(hue + 60) % 360}, 70%, 18%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  // Accent shapes
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = `hsl(${(hue + 200) % 360}, 80%, 60%)`;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(
      (Math.sin(seed + i) * 0.5 + 0.5) * width,
      (Math.cos(seed * 2 + i) * 0.5 + 0.5) * height,
      (Math.abs(Math.sin(i + seed)) * 0.15 + 0.05) * Math.min(width, height),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Prompt text overlay
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = `${Math.max(14, Math.floor(width / 24))}px ui-sans-serif, system-ui`;
  const text = prompt.slice(0, 60);
  ctx.fillText(text, 16, Math.max(28, Math.floor(height * 0.1)));
  return canvas.toDataURL("image/png");
}

export function PromptPanel() {
  const [prompt, setPrompt] = useState(
    "Generate a dramatic concept art scene with neon lighting."
  );
  const [provider, setProvider] = useState(PROVIDERS[0].value);
  const [sizeOpt, setSizeOpt] = useState<string>(SIZES[0].value);
  const [quality, setQuality] = useState<string>(QUALITIES[0].value);
  const [cw, setCw] = useState<number>(1024);
  const [ch, setCh] = useState<number>(1024);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createAiJob, addAiPreview, updateAiJob, aiJobs, addAsset, queueInsertAssetUrl } =
    useEditorStore((s) => ({
      createAiJob: s.createAiJob,
      addAiPreview: s.addAiPreview,
      updateAiJob: s.updateAiJob,
      aiJobs: s.aiJobs,
      addAsset: s.addAsset,
      queueInsertAssetUrl: s.queueInsertAssetUrl
    }));

  const resolvedSize = useMemo(() => {
    if (sizeOpt === "custom") return { width: cw, height: ch };
    const n = Number(sizeOpt);
    return { width: n, height: n };
  }, [sizeOpt, cw, ch]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const p = prompt.trim();
    if (!p) return;
    setIsSubmitting(true);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const job: AiJob = {
      id,
      prompt: p,
      provider: provider as any,
      size: resolvedSize,
      quality: quality as any,
      status: "generating",
      previews: [],
      createdAt: Date.now()
    };
    createAiJob(job);
    try {
      // generate 4 previews with slight delay
      for (let i = 0; i < 4; i++) {
        // eslint-disable-next-line no-await-in-loop
        const url = await generateMockImageDataUrl(p, resolvedSize.width, resolvedSize.height, i + 1);
        addAiPreview(id, { id: `${id}-${i + 1}`, url });
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 150));
      }
      updateAiJob(id, { status: "succeeded" });
    } catch (err: any) {
      updateAiJob(id, { status: "failed", error: err?.message ?? "Generation failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-900 bg-slate-950/70 p-4">
      <header className="mb-1 flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-brand" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold text-slate-200">AI Prompting</h2>
          <p className="text-xs text-slate-500">Mocked locally; providers wired later.</p>
        </div>
      </header>
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-300">
          Prompt
          <textarea
            className="min-h-[110px] rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-200 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/30"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe the scene you want to generate…"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-300">
            Provider
            <select
              className="rounded-xl border border-slate-800 bg-slate-950/50 p-2 text-sm text-slate-200 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/30"
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
            >
              {PROVIDERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-300">
            Quality
            <select
              className="rounded-xl border border-slate-800 bg-slate-950/50 p-2 text-sm text-slate-200 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/30"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            >
              {QUALITIES.map((q) => (
                <option key={q.value} value={q.value}>
                  {q.label}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-2 flex flex-col gap-1 text-xs font-medium text-slate-300">
            Size
            <div className="flex gap-2">
              <select
                className="w-40 rounded-xl border border-slate-800 bg-slate-950/50 p-2 text-sm text-slate-200 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/30"
                value={sizeOpt}
                onChange={(e) => setSizeOpt(e.target.value)}
              >
                {SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {sizeOpt === "custom" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={64}
                    max={2048}
                    value={cw}
                    onChange={(e) => setCw(Number(e.target.value) || 0)}
                    className="w-28 rounded-xl border border-slate-800 bg-slate-950/50 p-2 text-sm text-slate-200 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/30"
                  />
                  <span className="text-slate-500">×</span>
                  <input
                    type="number"
                    min={64}
                    max={2048}
                    value={ch}
                    onChange={(e) => setCh(Number(e.target.value) || 0)}
                    className="w-28 rounded-xl border border-slate-800 bg-slate-950/50 p-2 text-sm text-slate-200 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              ) : null}
            </div>
          </label>
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-slate-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Generating…" : "Generate"}
        </button>
      </form>

      {/* Jobs history */}
      <div className="mt-2 flex flex-col gap-3">
        {aiJobs.length === 0 ? (
          <p className="text-xs text-slate-500">No generations yet.</p>
        ) : (
          aiJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-slate-900/60 bg-slate-900/40 p-3"
            >
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {job.provider} · {job.size.width}×{job.size.height} · {job.quality}
                </span>
                <span
                  className={
                    job.status === "succeeded"
                      ? "text-emerald-400"
                      : job.status === "failed"
                      ? "text-rose-400"
                      : "text-amber-400"
                  }
                >
                  {job.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {job.previews.map((p, idx) => (
                  <div
                    key={p.id}
                    className="group relative overflow-hidden rounded-md border border-slate-900/60 bg-slate-900/50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="AI preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/40 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => queueInsertAssetUrl(p.url)}
                        className="rounded-md bg-slate-800/80 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-800"
                      >
                        Insert
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          addAsset({
                            id: `${job.id}-asset-${idx + 1}`,
                            name: `AI ${job.size.width}x${job.size.height} #${idx + 1}`,
                            url: p.url,
                            source: "ai"
                          })
                        }
                        className="rounded-md bg-brand/80 px-2 py-1 text-[10px] text-white hover:bg-brand/90"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
