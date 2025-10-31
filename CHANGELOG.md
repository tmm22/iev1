## Changelog

All notable changes to this project will be documented in this file.

### 2025-10-31
- PR #16 merged: Selection tool + transforms, numeric properties, local revisions UI
  - Konva Transformer for resize/rotate; click-to-select, drag-to-move
  - Arrow-key nudge (1px; Shift for 10px)
  - Properties panel bound to x/y/w/h/rotation
  - Store-managed image layers; export/import uses layers
  - Debounced autosave + revisions dropdown (last 10) with restore
- CI: Fix pnpm setup ordering in Web CI workflow (set up pnpm before setup-node; defer version to packageManager)
- PR #17 opened: Multi-select + group/ungroup scaffold (Transformer across multiple nodes; keyboard group/ungroup; Layers panel buttons)

### 2025-10-30
- Phase 1 shell merged (PR #4)
### 2025-10-30
- Frontend Phase 1 start
  - Konva + react-konva scaffold added
  - EditorShell now uses CanvasKonva (dynamic, client-only)
  - Viewport controls: Space to pan (drag), wheel to zoom
  - Tools: basic Brush/Eraser drawing on a temp draw layer
  - Layers: drag-and-drop reordering + keyboard Cmd/Ctrl+[ and ]
  - Panels: resizable/collapsible with local persistence

  - Tool palette with hotkeys (V/H/B/E/T/M/Z)
  - Layers panel (add/remove/select, show/hide)
  - Properties panel (brush size/color; layer name/opacity)
  - Global shortcuts (undo/redo) and header badges updated to Phase 1
  - Canvas placeholder integrated with store (tool/layer preview)
  - Store extended (tools, layers, tool props) via Zustand
  - Lint-staged stability and ESLint scope adjustments

### 2025-10-28
- Phase 0 scaffold finalized
  - Next.js App Router app
  - Clerk auth and middleware for /editor
  - UploadThing route stub + Convex adapter stub
  - Editor route with initial placeholder canvas and panels
  - Monorepo tooling and docs baseline
