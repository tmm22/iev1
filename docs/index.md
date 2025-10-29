# AI Image Editor Overview

Welcome to the public project page for the AI-powered image editor. This site summarizes the vision, roadmap, and setup guidance surfaced during Phase 0 of development.

## Project Vision

Build a web-based editor that merges traditional tooling with AI-driven generation and editing. Key services include:

- **Google Gemini Image (“Nano Banana”)** for consistent image generation and edit chains.
- **OpenAI GPT Image** for high-fidelity prompt following and multi-turn refinements.
- **Convex** as the realtime backend and orchestration layer.
- **UploadThing** for asset ingestion and CDN-backed delivery.
- **Clerk** delivering authentication and session management.

See the full plan in [`ai-image-editor-plan.md`](../ai-image-editor-plan.md) for a deep dive into use cases, architecture, and open questions.

## Current Status

- ✅ Monorepo scaffold with Next.js App Router (`apps/web`) and Convex backend stub (`convex/`).
- ✅ Phase 0 editor shell with AI prompt/asset panels and undo/redo state powered by Zustand.
- ✅ Clerk authentication wired through middleware, sign-in/up routes, and session-aware UI.
- ✅ UploadThing route live via `/api/uploadthing`; provide keys to enable real uploads.
- 📌 Pending: Convex function implementation, AI provider integration, and production hardening.

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
| Phase 0 | Foundations | Repository scaffold, auth wiring, mocked AI surface, live UploadThing bridge, documentation |
| Phase 1 | AI Generation | Integrate Gemini & OpenAI generation calls, job tracking, gallery |
| Phase 2 | AI Editing | Masking tools, inpainting, streaming previews, prompt revision surfacing |
| Phase 3 | Collaboration | Presence, commenting, activity feeds, Convex workflows |
| Phase 4 | Production polish | Accessibility, telemetry, performance tuning, deployment automation |

## Deployment Notes

GitHub Pages hosts this documentation (`/docs` directory). The interactive editor itself requires a runtime (Vercel + Convex) due to Clerk authentication and server-side coordination. Use this page to communicate project updates while development continues.

For questions or contributions, open an issue on the repository or contact the maintainers. Thanks for checking out the project! 
