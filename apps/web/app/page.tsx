"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="rounded-full border border-slate-800 bg-slate-900 px-4 py-1 text-xs uppercase tracking-widest text-slate-400">
        Phase 0 Preview
      </span>
      <h1 className="text-4xl font-semibold text-white sm:text-5xl">
        AI Image Editor
      </h1>
      <p className="max-w-2xl text-slate-300">
        This environment scaffolds the upcoming AI-assisted image editor. Head
        to the editor shell to explore the placeholder canvas and verify the
        integration points for Convex, UploadThing, and authentication.
      </p>
      <Link
        href="/editor"
        prefetch={false}
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
      >
        Open Editor Shell
        <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
      </Link>
    </main>
  );
}
