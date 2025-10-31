# AI Image Editor – Phase 1 Shell

This repository hosts the experimental AI-powered image editor described in `ai-image-editor-plan.md`.

Status: Phase 1 shell with interactive canvas, layers, assets, mocked AI UI, autosave + local revisions, keyboard shortcuts, and CI.

## Repository Layout

```
apps/
  web/              # Next.js (App Router) client
convex/             # Convex backend functions & schema
packages/           # Reserved for shared packages (UI, utils)
```

Key documents:
- `ai-image-editor-plan.md` – product & technical strategy
- `docs/architecture.md` – frontend architecture (Konva canvas, state, autosave)
- `docs/phase-1-frontend-plan.md` – tasks + acceptance criteria (with completion status)
- `docs/phase-1-backend.md` – Phase 1 backend implementation
- `docs/phase-0-status.md` – Foundation phase completion
- `CHANGELOG.md` – merged milestones

## Getting Started

> **Prerequisites:** Node.js 18+, pnpm 9, Clerk API keys (publishable + secret), and the Convex CLI (`npm install -g convex`) once ready to run the backend locally.

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create a `.env` from `.env.sample` and populate secrets when available. Guest mode works without keys (mocked AI, no Convex persistence, Clerk bypass for dev/tests).
3. Start development servers:
   ```bash
   # Terminal 1 – Next.js
   pnpm --filter web dev
   # Terminal 2 – Convex
   pnpm --filter convex-backend dev
   ```
4. Visit `http://localhost:3000` → open Editor.

Note: UploadThing now runs against the live API via the App Router handler at `/api/uploadthing`. Ensure `UPLOADTHING_TOKEN` (v7 token from the UploadThing dashboard) and a Convex URL (`NEXT_PUBLIC_CONVEX_URL`) are present in your environment before starting the dev server. The root layout mounts UploadThing's `NextSSRPlugin` to hydrate client helpers without a loading flash, and completed uploads are mirrored into Convex via an internal `uploadLogs` record. Uploads can be promoted to canonical `assets` with project linking using the `promoteUploadToAsset` mutation. AI providers remain mocked. Clerk routes (`/sign-in`, `/sign-up`) use the default components with minimal styling; update the appearance config as needed.

### Current Capabilities (Phase 1 shell)
- Canvas (Konva): pan/zoom, selection, resize/rotate via Transformer
- Layers: add/remove, show/hide, reorder (DND + Cmd/Ctrl+[ / ])
- Properties: name, opacity, and numeric x/y/w/h/rotation bound to selection
- Tools: Brush/Eraser with adjustable size and color
- Assets: thumbnails (uploads/AI previews) → insert to canvas
- AI UI: parameters + mocked generation; previews grid
- Persistence: debounced autosave + local revisions (last 10) with restore; Convex save guarded by env
- Shortcuts: duplicate, delete, zoom +/-/fit, arrow nudge (1px; Shift=10px), group/ungroup (scaffold)
- Testing/CI: Vitest + RTL unit tests; Playwright smoke e2e enabled in CI via Web CI workflow

## Phase 1 Checklist (excerpt)
- [x] Konva canvas scaffold with pan/zoom
- [x] Selection + Transformer resize/rotate; numeric properties
- [x] Layers reorder (DND + keyboard) and visibility
- [x] Tools: Brush/Eraser
- [x] Assets browser with insert-to-canvas
- [x] Autosave + local revisions UI
- [x] Keyboard shortcuts (duplicate/delete/zoom/nudge)
- [x] Unit tests + CI workflow
- [ ] Multi-select + group/ungroup polish (PR #17)
- [ ] Snap-to-angles and bounds clamping
- [ ] Convex-backed revisions (env-gated)

See `ai-image-editor-plan.md#9-implementation-roadmap` for next-phase milestones.

## Reference Docs

- [Clerk production configuration checklist](docs/clerk-production-checklist.md)
- [GitHub Pages overview](docs/index.md) — published at https://tmm22.github.io/iev1 (main branch, `/docs`)

## Quality Gates

Run the full suite locally:
```bash
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web build
pnpm --filter web test
pnpm --filter web e2e --reporter=list
```
