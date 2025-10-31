import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon
} from "@heroicons/react/24/outline";
import { useEditorStore } from "@/lib/state/editorStore";
import dynamic from "next/dynamic";
const CanvasKonva = dynamic(() => import("./canvas/CanvasKonva").then(m => m.CanvasKonva), { ssr: false });
import { UploadPanel } from "./panels/UploadPanel";
import { PromptPanel } from "./panels/PromptPanel";
import { LayersPanel } from "./panels/LayersPanel";
import { AssetsPanel } from "./panels/AssetsPanel";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { ToolPalette } from "./tools/ToolPalette";
import { EditorShellSkeleton } from "./EditorShellSkeleton";
import { useEnsureUser } from "@/lib/convex/useEnsureUser";
import React from "react";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex/clientApi";

const NavButton = ({
  icon: Icon,
  label,
  onClick,
  disabled
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center gap-2 rounded-md border border-slate-800 px-3 py-2 text-xs font-medium transition ${
      disabled
        ? "cursor-not-allowed bg-slate-900/50 text-slate-500"
        : "bg-slate-900 text-slate-200 hover:bg-slate-800"
    }`}
  >
    <Icon className="h-4 w-4" aria-hidden="true" />
    {label}
  </button>
	);

const AuthControls = dynamic(
  () => import("./auth/AuthControlsClerk").then(m => m.AuthControlsClerk),
  { ssr: false, loading: () => null }
);

export default function EditorShell() {
  // Ensure user in Convex (no-op if Convex not configured)
  useEnsureUser();

  const { undo, redo, canUndo, canRedo, activeTool, setActiveTool } = useEditorStore((state) => ({
    undo: state.undo,
    redo: state.redo,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    activeTool: state.activeTool,
    setActiveTool: state.setActiveTool
  }));
  const { selectedLayerId, moveLayerUp, moveLayerDown, removeLayer, duplicateLayer } = useEditorStore((s) => ({
    selectedLayerId: s.selectedLayerId,
    moveLayerUp: s.moveLayerUp,
    moveLayerDown: s.moveLayerDown,
    removeLayer: s.removeLayer,
    duplicateLayer: s.duplicateLayer
  }));

  // Panel layout state (persisted locally)
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [leftWidth, setLeftWidth] = useState<number>(320);
  const [rightWidth, setRightWidth] = useState<number>(320);

  // Convex mutations (optional)
  const hasConvex = !!process.env.NEXT_PUBLIC_CONVEX_URL;
  const convexApiAvailable = Boolean((api as any)?.projects?.createProject) && Boolean((api as any)?.canvases?.createCanvas) && Boolean((api as any)?.canvases?.createRevision);
  let createProject: any = async () => "";
  let createCanvas: any = async () => "";
  let createRevision: any = async () => "";
  if (hasConvex && convexApiAvailable) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    createProject = useMutation((api as any).projects.createProject);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    createCanvas = useMutation((api as any).canvases.createCanvas);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    createRevision = useMutation((api as any).canvases.createRevision);
  }

  const saveSnapshot = useCallback(async () => {
    const snapshot = await new Promise<any>((resolve) => {
      const onExport = (e: Event) => {
        window.removeEventListener("canvas:export", onExport as any);
        resolve((e as CustomEvent).detail);
      };
      window.addEventListener("canvas:export", onExport as any, { once: true });
      window.dispatchEvent(new Event("canvas:requestExport"));
    });
    try {
      localStorage.setItem("canvas:lastSnapshot", JSON.stringify(snapshot));
    } catch {}
    try {
      const projId = localStorage.getItem("canvas:projectId");
      const canvasId = localStorage.getItem("canvas:canvasId");
      let p = projId as any;
      let c = canvasId as any;
      if (!p) {
        p = await createProject({ name: "My Project" });
        localStorage.setItem("canvas:projectId", p);
      }
      if (!c) {
        c = await createCanvas({ projectId: p, title: "Untitled" });
        localStorage.setItem("canvas:canvasId", c);
      }
      await createRevision({ canvasId: c, snapshotKey: JSON.stringify(snapshot) });
    } catch (e) {
      // Convex may be unavailable; ignore
      console.warn("Convex save skipped:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadSnapshot() {
    try {
      const raw = localStorage.getItem("canvas:lastSnapshot");
      if (!raw) return;
      const snap = JSON.parse(raw);
      window.dispatchEvent(new CustomEvent("canvas:import", { detail: snap }));
    } catch {}
  }

  // Autosave on canvas changes (debounced)
  useEffect(() => {
    let t: any = null;
    const handler = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        void saveSnapshot();
      }, 1200);
    };
    window.addEventListener("canvas:changed", handler);
    return () => {
      window.removeEventListener("canvas:changed", handler);
      if (t) clearTimeout(t);
    };
  }, [saveSnapshot]);

  useEffect(() => {
    try {
      const lc = localStorage.getItem("layout:leftCollapsed");
      const rc = localStorage.getItem("layout:rightCollapsed");
      const lw = localStorage.getItem("layout:leftWidth");
      const rw = localStorage.getItem("layout:rightWidth");
      if (lc != null) setLeftCollapsed(lc === "1");
      if (rc != null) setRightCollapsed(rc === "1");
      if (lw) setLeftWidth(Math.max(200, Math.min(500, parseInt(lw, 10))));
      if (rw) setRightWidth(Math.max(200, Math.min(500, parseInt(rw, 10))));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("layout:leftCollapsed", leftCollapsed ? "1" : "0");
      localStorage.setItem("layout:rightCollapsed", rightCollapsed ? "1" : "0");
      localStorage.setItem("layout:leftWidth", String(leftWidth));
      localStorage.setItem("layout:rightWidth", String(rightWidth));
    } catch {}
  }, [leftCollapsed, rightCollapsed, leftWidth, rightWidth]);

  // Resize handlers
  useEffect(() => {
    let resizing: null | { side: "left" | "right"; startX: number; startW: number } = null;
    const onMove = (e: MouseEvent) => {
      if (!resizing) return;
      const dx = e.clientX - resizing.startX;
      if (resizing.side === "left") {
        setLeftWidth((w) => Math.max(200, Math.min(500, resizing!.startW + dx)));
      } else {
        setRightWidth((w) => Math.max(200, Math.min(500, resizing!.startW - dx)));
      }
    };
    const onUp = () => {
      resizing = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    const start = (side: "left" | "right", startX: number) => {
      resizing = {
        side,
        startX,
        startW: side === "left" ? leftWidth : rightWidth
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };
    (window as any).startPanelResize = start;
    return () => {
      if ((window as any).startPanelResize) delete (window as any).startPanelResize;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [leftWidth, rightWidth]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      // Tool hotkeys when not typing in inputs
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      const key = e.key.toLowerCase();

      // Layer reordering
      if ((e.metaKey || e.ctrlKey) && (key === "[" || key === "]")) {
        e.preventDefault();
        if (!selectedLayerId) return;
        if (key === "[") moveLayerUp(selectedLayerId);
        if (key === "]") moveLayerDown(selectedLayerId);
        return;
      }

      // Duplicate layer: Cmd/Ctrl + D
      if ((e.metaKey || e.ctrlKey) && key === "d") {
        e.preventDefault();
        if (selectedLayerId) duplicateLayer(selectedLayerId);
        return;
      }

      // Delete layer: Delete or Backspace
      if ((key === "delete" || key === "backspace") && selectedLayerId) {
        // avoid when typing
        e.preventDefault();
        removeLayer(selectedLayerId);
        return;
      }

      // Zoom controls
      if ((e.metaKey || e.ctrlKey) && (key === "=" || key === "+")) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("canvas:zoom", { detail: { type: "in" } }));
        return;
      }
      if ((e.metaKey || e.ctrlKey) && key === "-") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("canvas:zoom", { detail: { type: "out" } }));
        return;
      }
      if ((e.metaKey || e.ctrlKey) && key === "0") {
        e.preventDefault();
        window.dispatchEvent(new Event("canvas:zoom:fit"));
        return;
      }
      const map: Record<string, import("@/lib/state/editorStore").EditorTool> = {
        v: "select",
        h: "hand",
        b: "brush",
        e: "eraser",
        t: "text",
        m: "shape",
        z: "zoom"
      };
      if (map[key]) {
        e.preventDefault();
        setActiveTool(map[key]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [redo, undo, setActiveTool, selectedLayerId, moveLayerUp, moveLayerDown, removeLayer, duplicateLayer]);

  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-900/60 bg-slate-950/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold text-slate-300">
            ← Back to overview
          </Link>
          <span className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs uppercase tracking-widest text-brand">
            Phase 1 Shell
          </span>
          <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300">
            Tool: {activeTool}
          </span>
          <div className="flex gap-2">
            <NavButton
              icon={ArrowUturnLeftIcon}
              label="Undo"
              onClick={undo}
              disabled={!canUndo}
            />
            <NavButton
              icon={ArrowUturnRightIcon}
              label="Redo"
              onClick={redo}
              disabled={!canRedo}
            />
            <button
              type="button"
              onClick={() => void saveSnapshot()}
              className="inline-flex items-center gap-2 rounded-md border border-emerald-700/40 bg-emerald-900/20 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-900/30"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => loadSnapshot()}
              className="inline-flex items-center gap-2 rounded-md border border-sky-700/40 bg-sky-900/20 px-3 py-2 text-xs font-medium text-sky-300 hover:bg-sky-900/30"
            >
              Load
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasClerk ? (
            <AuthControls />
          ) : (
            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300">
              Guest session
            </span>
          )}
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-14 flex-col items-center border-r border-slate-900/60 bg-slate-950">
          <ToolPalette />
        </aside>
        <aside
          className="flex flex-col gap-6 border-r border-slate-900/60 bg-slate-950 p-5 transition-[width] duration-150"
          style={{ width: leftCollapsed ? 0 : leftWidth }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Left Panel</span>
            <button
              type="button"
              onClick={() => setLeftCollapsed((v) => !v)}
              className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
            >
              {leftCollapsed ? "Show" : "Hide"}
            </button>
          </div>
          <PromptPanel />
          <UploadPanel />
          <AssetsPanel />
          <LayersPanel />
        </aside>
        {/* Left resizer */}
        {!leftCollapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            onMouseDown={(e) => (window as any).startPanelResize?.("left", e.clientX)}
            className="w-1 cursor-col-resize bg-slate-900/60 hover:bg-slate-800"
          />
        )}
        <main className="flex flex-1 flex-col gap-6 overflow-hidden bg-slate-950 p-6">
          <section className="flex flex-1 overflow-hidden rounded-2xl border border-slate-900/60 bg-slate-900/40 shadow-inner">
            <CanvasKonva />
          </section>
        </main>
        {/* Right resizer */}
        {!rightCollapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            onMouseDown={(e) => (window as any).startPanelResize?.("right", e.clientX)}
            className="w-1 cursor-col-resize bg-slate-900/60 hover:bg-slate-800"
          />
        )}
        <aside
          className="flex flex-col gap-6 border-l border-slate-900/60 bg-slate-950 p-5 transition-[width] duration-150"
          style={{ width: rightCollapsed ? 0 : rightWidth }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Properties</span>
            <button
              type="button"
              onClick={() => setRightCollapsed((v) => !v)}
              className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
            >
              {rightCollapsed ? "Show" : "Hide"}
            </button>
          </div>
          <PropertiesPanel />
        </aside>
      </div>
      <footer className="flex items-center justify-between border-t border-slate-900/60 bg-slate-950 px-6 py-3 text-xs text-slate-500">
        <span>
          AI Image Editor – Phase 1 shell. AI providers and uploads currently operate in mock mode.
        </span>
        <span>
          Undo: {canUndo ? "available" : "n/a"} · Redo: {canRedo ? "available" : "n/a"}
        </span>
      </footer>
    </div>
  );
}
