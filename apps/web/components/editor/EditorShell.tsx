import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon
} from "@heroicons/react/24/outline";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
  useUser
} from "@clerk/nextjs";
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

export default function EditorShell() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { undo, redo, canUndo, canRedo, activeTool, setActiveTool } = useEditorStore((state) => ({
    undo: state.undo,
    redo: state.redo,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    activeTool: state.activeTool,
    setActiveTool: state.setActiveTool
  }));
  const { selectedLayerId, moveLayerUp, moveLayerDown } = useEditorStore((s) => ({
    selectedLayerId: s.selectedLayerId,
    moveLayerUp: s.moveLayerUp,
    moveLayerDown: s.moveLayerDown
  }));

  // Panel layout state (persisted locally)
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [leftWidth, setLeftWidth] = useState<number>(320);
  const [rightWidth, setRightWidth] = useState<number>(320);

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
  }, [redo, undo, setActiveTool, selectedLayerId, moveLayerUp, moveLayerDown]);

  const initials = useMemo(() => {
    if (!user) {
      return "AI";
    }
    const base =
      user.fullName ??
      user.username ??
      [user.firstName, user.lastName].filter(Boolean).join(" ") ??
      user.id;
    return base
      .split(" ")
      .filter(Boolean)
      .map((chunk) => chunk[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "session@pending.dev";

  if (!isLoaded) {
    return <EditorShellSkeleton />;
  }

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
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-md border border-brand/40 bg-brand/10 px-3 py-2 text-xs font-medium text-brand transition hover:bg-brand/20">
                Sign in to continue
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300">
              {isSignedIn ? `Session: ${email}` : "Authenticating…"}
            </span>
            <div className="flex h-9 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900 font-semibold text-slate-200">
                {initials}
              </div>
              <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
              <SignOutButton>
                <button className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800">
                  Sign out
                </button>
              </SignOutButton>
            </div>
          </SignedIn>
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
