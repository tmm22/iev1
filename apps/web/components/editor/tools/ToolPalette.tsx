"use client";

import {
  CursorArrowRaysIcon,
  HandRaisedIcon,
  PencilIcon,
  BackspaceIcon,
  DocumentTextIcon,
  RectangleGroupIcon,
  MagnifyingGlassPlusIcon
} from "@heroicons/react/24/outline";
import { useEditorStore } from "@/lib/state/editorStore";

const TOOLS: {
  id: import("@/lib/state/editorStore").EditorTool;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  key?: string;
}[] = [
  { id: "select", label: "Select (V)", icon: CursorArrowRaysIcon, key: "v" },
  { id: "hand", label: "Hand (H)", icon: HandRaisedIcon, key: "h" },
  { id: "brush", label: "Brush (B)", icon: PencilIcon, key: "b" },
  { id: "eraser", label: "Eraser (E)", icon: BackspaceIcon, key: "e" },
  { id: "text", label: "Text (T)", icon: DocumentTextIcon, key: "t" },
  { id: "shape", label: "Shape (M)", icon: RectangleGroupIcon, key: "m" },
  { id: "zoom", label: "Zoom (Z)", icon: MagnifyingGlassPlusIcon, key: "z" }
];

export function ToolPalette() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);

  return (
    <nav className="flex flex-col items-center gap-2 p-2">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          onClick={() => setActiveTool(tool.id)}
          aria-label={tool.label}
          className={`group flex h-10 w-10 items-center justify-center rounded-lg border text-slate-200 transition ${
            activeTool === tool.id
              ? "border-brand/60 bg-brand/20"
              : "border-slate-800 bg-slate-900 hover:bg-slate-800"
          }`}
          title={tool.label}
        >
          <tool.icon className="h-5 w-5" />
        </button>
      ))}
    </nav>
  );
}
