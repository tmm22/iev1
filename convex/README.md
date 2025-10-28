## Convex Backend Scaffold

This directory contains the early-stage Convex backend. The schema captures the
core entities (users, projects, canvases, assets, AI jobs) described in the plan.
Functions will be added as AI integrations come online.

### Getting Started

1. Install Convex CLI  
   ```bash
   npm install -g convex
   ```
2. Initialize or link your deployment  
   ```bash
   pnpm --filter convex-backend dev
   ```
   The first run will prompt for authentication and create the `_generated`
   folder. The placeholder TypeScript stubs can then be replaced with the real
   generated files.

3. Implement functions inside `convex/` using the helper pattern documented in
   `ai-image-editor-plan.md`.

### Notes

- `schema.ts` is the authoritative data model for Phase 0.
- Additional helpers (auth, upload coordination, AI job orchestration) will live
  in this folder following the `convex/model` pattern once Convex generation runs.
