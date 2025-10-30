# Phase 1 – Frontend Plan

Status: planned

## Scope
Deliver a usable Phase 1 editor frontend built on the Phase 1 shell with basic canvas interactions, asset browsing, and AI generation UI wiring (mocked or real as backend matures).

## Work Items
- Canvas engine decision and scaffold (Fabric.js/Konva/custom WebGL)
- Viewport: pan/zoom (space-drag, wheel zoom, fit, reset)
- Tools – Brush/Eraser: basic draw on active layer (local state)
- Layers: drag-and-drop reorder + keyboard (Cmd/Ctrl+[ / ])
- Panels: resizable/collapsible; persist layout locally
- Assets browser: thumbnails for uploads/AI outputs; insert to canvas
- AI generation UI: params (size/quality), prompt history, job status/errors
- AI previews grid → add-to-canvas actions (new layer, replace BG)
- Shortcuts: delete, duplicate, zoom +/-/fit, selection bbox, tool tweaks
- Persistence: save/load project/canvas via Convex; restore last session
- QA: e2e (prompt→preview→insert) + unit tests for store/tools

## Acceptance Criteria
- Users can pan/zoom and draw with Brush on a selected layer.
- Layers can be re-ordered; properties reflect selection.
- Panels can be resized/collapsed and layout persists.
- Assets browser shows recent uploads/AI results with insert-to-canvas.
- AI generation UI accepts params and shows job status/errors.
- Project/canvas can be saved and restored.
- All checks pass: lint, typecheck, build, basic e2e.

## Tracking
- See CHANGELOG.md for merged milestones.
- Link issues/PRs here as they’re opened.
