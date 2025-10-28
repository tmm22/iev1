"use client";

import { FormEvent, useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/lib/state/editorStore";

const PROVIDERS = [
  { label: "Auto (recommended)", value: "auto" },
  { label: "Gemini Image (Nano Banana)", value: "gemini" },
  { label: "OpenAI GPT Image", value: "openai" }
];

export function PromptPanel() {
  const [prompt, setPrompt] = useState(
    "Generate a dramatic concept art scene with neon lighting."
  );
  const [provider, setProvider] = useState(PROVIDERS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pushState = useEditorStore((state) => state.pushState);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) {
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      pushState(
        `[mock-generation] provider=${provider} :: prompt="${prompt.trim()}"`
      );
      setIsSubmitting(false);
    }, 450);
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-900 bg-slate-950/70 p-4">
      <header className="flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-brand" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            AI Prompting
          </h2>
          <p className="text-xs text-slate-500">
            Routes requests to Gemini or GPT Image in later phases.
          </p>
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
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-slate-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending prompt…" : "Send prompt"}
        </button>
      </form>
    </section>
  );
}
