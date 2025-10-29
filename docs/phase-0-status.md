# Phase 0 Status – AI Image Editor

_Updated: 2025-10-29_

## Completed Foundations
- **Project structure**: pnpm monorepo with `apps/web` (Next.js) and `apps/convex-backend` (Convex CLI wrapper), plus shared TypeScript config.
- **UI shell**: `/editor` route renders the Phase 0 editor layout (header, sidebar panels, placeholder canvas) with Zustand-backed undo/redo state and Clerk-powered session display.
- **UploadThing integration**: `/api/uploadthing` proxies to UploadThing using live credentials, the root layout hydrates helpers via `NextSSRPlugin`, and uploads are mirrored into Convex `uploadLogs` when a deployment URL is configured.
- **AI prompt panel**: Form routes prompts to mock handler, writing entries into editor history to exercise undo/redo controls and demonstrate provider switch.
- **Environment hygiene**: `.env.example` enumerates required variables; `lib/env.ts` performs runtime validation (logs warnings during Phase 0).
- **Convex scaffold**: `convex/schema.ts` codifies initial data model (users, projects, canvases, assets, aiJobs). Package scripts ready for `convex dev` once credentials are linked.
- **Clerk integration**: `@clerk/nextjs` wired into App Router (`ClerkProvider`, middleware, sign-in/up routes) with `/editor` protection and deployment-safe middleware fallbacks when Clerk env keys are absent.

## Work Remaining to Exit Phase 0
- Install dependencies (`pnpm install`) and verify `pnpm dev` + `pnpm convex:dev` run concurrently.
- Connect Clerk identities to Convex helper functions (`convex/auth` utilities) and persist user records.
- Run `convex dev` to generate the `_generated` types and implement initial queries/mutations (`convex/model/*` helpers).
- Promote UploadThing upload logs into canonical `assets` records once project linking + user provisioning is ready.
- Add automated lint/typecheck Git hooks or CI pipeline once dependencies are installed.

## Suggested Next Actions (Phase 1 Prep)
1. Provision OpenAI + Google API keys and define per-environment cost budgets (per plan Section 10).
2. Harden Clerk configuration for production (custom domains, JWT key, redirect URLs) using `docs/clerk-production-checklist.md`; expose Convex helpers for server-side auth.
3. Implement Convex Rate Limiter component to guard incoming AI requests before enabling real providers.
4. Begin AI integration spike: wire Gemini Image via Convex action (internal) and expose request pipeline from `PromptPanel`.
5. Evaluate canvas renderer options (Fabric.js vs custom WebGL) and prototype state hydration with Convex persistence.

## Notes
- The date placeholder above can be replaced with the actual update timestamp when publishing to documentation.
- This document should evolve alongside each sprint; new sections can track metrics, blockers, or integration status.
