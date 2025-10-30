# Frontend Architecture Overview

This document captures the current frontend architecture state post-Phase 1 shell.

## Layout
- Left tool palette (vertical)
- Left sidebar: Prompt, Uploads, Layers
- Canvas center: placeholder wired to state (tool/layer props preview)
- Right sidebar: Properties (contextual for tool/layer)
- Header/footer: status, undo/redo, session info

## State (Zustand)
`apps/web/lib/state/editorStore.ts`
- History: `history`, `historyIndex`, actions: `pushState`, `undo`, `redo`
- Assets: `assets`, actions: `addAsset`, `removeAsset`
- Tools: `activeTool`, action: `setActiveTool`
- Layers: `layers`, `selectedLayerId`, actions: `addLayer`, `removeLayer`, `selectLayer`, `toggleLayerVisibility`, `setLayerOpacity`, `renameLayer`
- Tool props: `toolProps.brushSize`, `toolProps.primaryColor`, actions: `setBrushSize`, `setPrimaryColor`

## Key Components
- `EditorShell`: frame + sidebars + canvas + shortcuts
- `ToolPalette`: tool selection with hotkeys
- `LayersPanel`: list with add/remove/show/hide/select
- `PropertiesPanel`: brush size/color; layer name/opacity
- `CanvasPlaceholder`: renders preview from store state

## Integrations (scaffolded)
- Clerk auth via middleware and header UI
- UploadThing route with Convex adapter stub

## Next Steps
See `docs/phase-1-frontend-plan.md` for Phase 1 frontend tasks and acceptance criteria.
