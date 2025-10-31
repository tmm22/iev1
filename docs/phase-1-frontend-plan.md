# Phase 1 – Frontend Plan

Status: in progress (several items complete)

## Scope
Deliver a usable Phase 1 editor frontend built on the Phase 1 shell with basic canvas interactions, asset browsing, and AI generation UI wiring (mocked or real as backend matures).

## Work Items (checklist)
- [x] Canvas engine decision and scaffold (Konva)
- [x] Viewport: pan/zoom (space-drag, wheel zoom, fit, reset)
- [x] Tools – Brush/Eraser: basic draw (local state)
- [x] Layers: drag-and-drop reorder + keyboard (Cmd/Ctrl+[ / ])
- [x] Panels: resizable/collapsible; persist layout locally
- [x] Assets browser: thumbnails for uploads/AI outputs; insert to canvas
- [x] AI generation UI: params (size/quality), prompt history, job status/errors (mocked)
- [x] AI previews grid → add-to-canvas actions (new layer)
- [x] Shortcuts: delete, duplicate, zoom +/-/fit, arrow nudge (1/10px)
- [x] Selection: click-to-select; Transformer resize/rotate; numeric x/y/w/h/rotation in Properties
- [x] Persistence: autosave + local revisions (10) with restore; Convex save/load guarded by env
- [x] QA: unit tests + Playwright smoke e2e + GitHub Actions CI
- [ ] Multi-select + group/ungroup polish (scaffold merged behind PR #17)
- [ ] Snap-to-angles and bounds clamping
- [ ] Convex-backed revisions (env-gated)

## Acceptance Criteria
- Users can pan/zoom and draw with Brush/Eraser
- Selection supports resize/rotate with bounding box; properties reflect numeric transforms
- Layers can be re-ordered; visibility toggled; keyboard reorder works
- Panels can be resized/collapsed and layout persists
- Assets browser shows uploads/AI results with insert-to-canvas
- AI generation UI accepts params and shows job status/errors (mocked provider)
- Autosave persists work with local revisions; Convex save/load works when env is set
- All checks pass: lint, typecheck, build, unit tests; e2e smoke passes

## Tracking
- See CHANGELOG.md for merged milestones.
- PR #16 – Selection + transforms + revisions UI (merged)
- PR #17 – Multi-select + group/ungroup scaffold (open)
