"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { EditorShellSkeleton } from "@/components/editor/EditorShellSkeleton";

const EditorShell = dynamic(
  () => import("@/components/editor/EditorShell"),
  { ssr: false, loading: () => <EditorShellSkeleton /> }
);

export default function EditorPage() {
  return (
    <Suspense fallback={<EditorShellSkeleton />}>
      <EditorShell />
    </Suspense>
  );
}
