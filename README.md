# AI Image Editor – Phase 0 Scaffold

This repository hosts the experimental AI-powered image editor described in `ai-image-editor-plan.md`. The current focus is Phase 0: establishing the baseline developer environment so future phases (AI integrations, collaboration, production hardening) have a stable foundation.

## Repository Layout

```
apps/
  web/              # Next.js (App Router) client
convex/             # Convex backend functions & schema
packages/           # Reserved for shared packages (UI, utils)
```

Key documents:
- `ai-image-editor-plan.md` – product & technical strategy.
- `docs/` (future) – extended architecture notes as phases progress.

## Getting Started (Phase 0)

> **Prerequisites:** Node.js 18+, pnpm 9, Clerk API keys (publishable + secret), and the Convex CLI (`npm install -g convex`) once ready to run the backend locally.

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create a `.env` based on `.env.example` and populate secrets once available.
3. Start development servers:
   ```bash
   # Terminal 1 – Next.js
   pnpm --filter web dev
   # Terminal 2 – Convex
   pnpm --filter convex-backend dev
   ```
4. Visit `http://localhost:3000` for the web shell and follow on-screen instructions.

Note: UploadThing + AI providers are currently mocked. Refer to `apps/web/lib/uploadthing/mockClient.ts` for the placeholder implementation. Clerk routes (`/sign-in`, `/sign-up`) use the default components with minimal styling; update the appearance config as needed.

## Phase 0 Checklist

- [ ] Next.js shell renders editor layout with placeholder canvas.
- [ ] Convex dev server exposes dummy schema & auth utilities.
- [ ] Clerk authentication configured (publishable + secret keys) and `/editor` gate enforced.
- [ ] UploadThing helpers return deterministic mocked URLs while infra is provisioned.
- [ ] Documentation & scripts kept current (this README, `.env.example`, package scripts).

See `ai-image-editor-plan.md#9-implementation-roadmap` for next-phase milestones.

## Reference Docs

- [Clerk production configuration checklist](docs/clerk-production-checklist.md)
- [GitHub Pages overview](docs/index.md) — published at https://tmm22.github.io/iev1 (main branch, `/docs` source)
