# Frontend Architecture Overview

This document captures the current frontend architecture state post-Phase 1 updates.

## Layout
- Left tool palette (vertical)
- Left sidebar: Prompt, Uploads, Layers
- Canvas center: Konva-based canvas (`CanvasKonva`) with pan/zoom, selection, and transform handles
- Right sidebar: Properties (contextual for tool/layer)
- Header/footer: status, undo/redo, session info

## State (Zustand)
`apps/web/lib/state/editorStore.ts`
- History: `history`, `historyIndex`, actions: `pushState`, `undo`, `redo`
- Assets: `assets`, actions: `addAsset`, `removeAsset`
- Tools: `activeTool`, action: `setActiveTool`
- Layers model: `EditorLayer` now supports `kind`, `imageUrl`, `x/y/width/height/rotation`, optional `groupId`
- Selection: `selectedLayerId` (primary) and `selectedLayerIds` (multi); actions `selectLayer`, `toggleSelectLayer`, `setSelection`, `clearSelection`
- Layer transforms: `setLayerTransform(id, patch)`, `nudgeLayer`, `nudgeSelected`
- Grouping: `groupSelection`, `ungroupSelection`
- Properties: `setLayerOpacity`, `toggleLayerVisibility`, `renameLayer`, reorder (`moveLayer`, DND + keyboard)
- Tool props: `toolProps.brushSize`, `toolProps.primaryColor`, actions: `setBrushSize`, `setPrimaryColor`

## Key Components
- `EditorShell`: frame + sidebars + canvas + shortcuts; debounced autosave; local revisions UI (ring buffer of last 10)
- `ToolPalette`: tool selection with hotkeys
- `LayersPanel`: add/remove/show/hide/reorder; single/multi-select; Group/Ungroup buttons (logical `groupId`)
- `PropertiesPanel`: tool settings; for layers: name/opacity and numeric x/y/w/h/rotation (single selection), shows count on multi
- `CanvasKonva`: Konva Stage+Layer(s); draw lines for Brush/Eraser; image layers sourced from store; selection via click; Konva `Transformer` supports single or multiple nodes; emits `canvas:changed` on draw/drag/transform

## Integrations
- Clerk auth via middleware and header UI; bypassed in tests/guest mode
- UploadThing route active via App Router; Convex adapter guarded by env
- Convex client provider wrapped in optional guards; save/load wired when env is configured

## Autosave & Events
- Canvas emits `canvas:changed` for debounced autosave from `EditorShell`
- Export/import snapshot through window events: `canvas:requestExport` → `canvas:export`, and `canvas:import` for restore
- Local revisions stored in `localStorage` under `canvas:revisions` (last 10), surfaced in header dropdown

## Next Steps
See `docs/phase-1-frontend-plan.md` for tasks and acceptance criteria. Current in-flight: multi-select polish, snap-to-angles, Convex-backed revisions.
