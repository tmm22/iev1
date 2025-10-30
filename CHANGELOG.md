## Changelog

All notable changes to this project will be documented in this file.

### 2025-10-30
- Phase 1 shell merged (PR #4)
### 2025-10-30
- Frontend Phase 1 start
  - Konva + react-konva scaffold added
  - EditorShell now uses CanvasKonva (dynamic, client-only)
  - Viewport controls: Space to pan (drag), wheel to zoom
  - Tools: basic Brush/Eraser drawing on a temp draw layer

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
