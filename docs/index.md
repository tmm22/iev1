# AI Image Editor Overview

Welcome to the public project page for the AI-powered image editor. This site summarizes the vision, roadmap, and setup guidance. Phase 1 shell is now active with an interactive canvas and core tooling.

## Project Vision

Build a web-based editor that merges traditional tooling with AI-driven generation and editing. Key services include:

- **Google Gemini Image (“Nano Banana”)** for consistent image generation and edit chains.
- **OpenAI GPT Image** for high-fidelity prompt following and multi-turn refinements.
- **Convex** as the realtime backend and orchestration layer.
- **UploadThing** for asset ingestion and CDN-backed delivery.
- **Clerk** delivering authentication and session management.

See the full plan in [`ai-image-editor-plan.md`](../ai-image-editor-plan.md) for a deep dive into use cases, architecture, and open questions.

## Current Status

- ✅ Monorepo with Next.js App Router (`apps/web`) + Convex backend scaffold
- ✅ Phase 1 shell: Konva canvas with pan/zoom, selection, resize/rotate via Transformer
- ✅ Layers: add/remove, show/hide, drag-and-drop reorder + keyboard shortcuts
- ✅ Properties: numeric x/y/w/h/rotation bound to selection
- ✅ Tools: Brush/Eraser with size and color
- ✅ Assets: thumbnails (uploads/AI previews) with insert-to-canvas
- ✅ AI UI: parameters + mocked generation; previews grid
- ✅ Autosave: debounced; local revisions (last 10) with restore UI
- ✅ Testing & CI: Vitest unit tests, Playwright smoke e2e, GitHub Actions Web CI
- 🚧 In flight: multi-select + group/ungroup scaffold (PR #17)
- 📌 Next: snap-to-angles, Convex-backed revisions (env-gated), upload thumbnails, real AI providers

More details live inside [`docs/phase-0-status.md`](phase-0-status.md).

## Getting Started Locally

1. Install prerequisites: Node.js 18+, pnpm 9+, Convex CLI (`npm install -g convex`).
2. Duplicate `.env.example` → `.env` and populate values (Clerk keys, UploadThing, Convex, OpenAI, Gemini).
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Run the web app and Convex server in separate terminals:
   ```bash
   pnpm --filter web dev
   pnpm --filter convex-backend dev
   ```
5. Visit `http://localhost:3000` and authenticate via Clerk to access `/editor`.

Consult [`docs/clerk-production-checklist.md`](clerk-production-checklist.md) before deploying to production.

## Roadmap Snapshot

| Phase | Focus | Highlights |
| --- | --- | --- |
| Phase 0 | Foundations | Repository scaffold, auth wiring, mocked AI surface, UploadThing SSR bridge + Convex logging, documentation |
| Phase 1 | Interactive Editor + mocked AI | Konva canvas, layers/properties, autosave + local revisions, AI previews |
| Phase 2 | AI Editing | Masking tools, inpainting, streaming previews, prompt revision surfacing |
| Phase 3 | Collaboration | Presence, commenting, activity feeds, Convex workflows |
| Phase 4 | Production polish | Accessibility, telemetry, performance tuning, deployment automation |

## Deployment Notes

GitHub Pages hosts this documentation (`/docs` directory). The interactive editor itself requires a runtime (Vercel + Convex) due to Clerk authentication and server-side coordination. Use this page to communicate project updates while development continues.

For questions or contributions, open an issue on the repository or contact the maintainers. Thanks for checking out the project! 
