"use client";

export function EditorShellSkeleton() {
  return (
    <div className="flex min-h-screen flex-col gap-4 bg-slate-950 p-6 text-slate-800">
      <div className="h-12 w-full animate-pulse rounded-xl bg-slate-800/40" />
      <div className="grid flex-1 grid-cols-[20rem,1fr] gap-4">
        <div className="flex flex-col gap-3">
          <div className="h-48 animate-pulse rounded-2xl bg-slate-800/40" />
          <div className="h-48 animate-pulse rounded-2xl bg-slate-800/40" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex h-16 gap-3">
            <div className="flex-1 animate-pulse rounded-2xl bg-slate-800/40" />
            <div className="w-40 animate-pulse rounded-2xl bg-slate-800/40" />
          </div>
          <div className="flex-1 animate-pulse rounded-3xl bg-slate-800/40" />
        </div>
      </div>
      <div className="h-10 w-full animate-pulse rounded-xl bg-slate-800/40" />
    </div>
  );
}
