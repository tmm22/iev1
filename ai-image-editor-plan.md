# AI-Powered Image Editor Plan

## 1. Product Vision & Success Criteria
- Build a web-based image editor that fuses manual controls with AI assistance via Google Gemini Image (“Nano Banana”), OpenAI GPT Image, and a Convex-powered backend while persisting assets in UploadThing.
- Prioritize creative professionals and growth teams who need rapid ideation, iterative edits, and export-ready assets without leaving the browser; secondary goal is to expose an embeddable editor SDK.
- Success indicators: <5 min first publish, ≥70% of edits leveraging AI suggestions, sub-2s perceived latency for prompt-to-preview, and operational metrics (error rate <1%, p95 upload <4s).

## 2. Core Use Cases & Feature Set
- **Project workspaces**: authenticated dashboards listing projects, versioned canvases, shared asset libraries, and permission-aware collaboration.
- **AI-assisted generation**: prompt-first experience with model selector (Gemini Image vs GPT Image), style presets, prompt history, partial re-prompts, and negative prompt controls.
- **AI-assisted editing**: mask-based edits, background removal, fill/replace, style transfer, text-to-layer, inpainting, re-coloring, and iteration chains; leverage both Gemini’s native editing and OpenAI multi-turn refinements.
- **Manual tooling**: vector layers, raster brushes, typography, filters, layering, blend modes, snapping, grids, and color palettes; GPU-accelerated canvas (WebGL / WebGPU) with undo/redo stack synced to Convex.
- **Asset lifecycle**: upload via UploadThing (drag/drop, clipboard paste, server-side imports), automatic metadata extraction, tagging, format conversion, download presets (PNG, JPEG, WebP, SVG where possible).
- **Collaboration**: presence indicators, comment threads, activity timeline, shared prompt notebooks, optional real-time co-editing (staged for later milestone).

## 3. System Architecture Overview
- **Client**: React (Next.js App Router recommended) with state split into local (canvas) vs synchronized (Convex queries/mutations). Use Zustand/Recoil for local canvas state, Convex React hooks for realtime data.
- **Backend**: Convex for auth, project metadata, AI job orchestration, prompt history, rate limiting, and webhooks. Follow Convex best practices to ensure transactional safety and low-latency reactivity.
- **Storage**: UploadThing handles file ingress/egress; Convex stores file metadata (keys, signed URL expiry, derived assets) and coordinates callbacks.
- **AI services**: 
  - Google Gemini Image (“Nano Banana”) via `google-genai` SDK (v1) or REST from ai.google.dev.
  - OpenAI GPT Image (`gpt-image-1`) through Image API and Responses API for conversational edits.
- **High-level flow**: 
  1. User uploads or generates prompt → UI requests presigned upload or AI job.
  2. Convex validates session, stores request, triggers AI action (internal functions only).
  3. AI output (image or intermediate data) persisted via UploadThing (for uploads) or Convex storage (for metadata); canvas updated in real time.
  4. Optional post-processing (e.g., background removal, resizing) handled in Convex actions with rate-limited external service calls.

## 4. AI Services Strategy

### 4.1 Google Gemini Image (“Nano Banana”)
- Gemini API Cookbook (GitHub, 2024) highlights Gemini Image (aka 🍌 nano banana) as the native image generation/editing pathway with consistency across edit chains; rely on the latest Gemini 2.5 models for improved fidelity.
- Use Google AI Studio to manage API keys; migrate to the `google-genai` SDK (v1.0+) for compatibility with Gemini 2 features and Live API streaming (per cookbook migration guidance).
- Capabilities leveraged:
  - Image-to-image editing (`Image_out` quickstart) for masked edits and style transitions.
  - Prompt-grounded generation (optionally using “Grounding with Google Maps” for location-aware assets if needed).
  - Batch mode for background generation jobs requiring lower cost (cookbook Batch-mode guide).
- Implementation notes:
  - Encapsulate Gemini calls in Convex internal actions (`internal.ai.gemini.generate`) to limit exposure and reuse helper functions.
  - Store prompt + revised prompt pairs to educate users on prompt engineering; Gemini provides revised prompts in responses.
  - Consider Live API for future real-time co-creation (streaming partial outputs to canvas previews).

### 4.2 OpenAI GPT Image
- OpenAI Image Generation Guide (2024) recommends `gpt-image-1` for high-quality, instruction-following assets. Split usage between:
  - **Image API** for single-shot generations or server-rendered tasks.
  - **Responses API** with `image_generation` tool for conversational, multi-turn edits and iterative refinements (supports `previous_response_id` and image IDs).
- Support streaming partial images (set `partial_images` > 0) to enhance UX with progressive previews; each partial costs +100 image tokens—monitor usage.
- Allow users to select quality/size combinations (OpenAI cost table) and warn about latency when high quality/resolution is requested (~2 min worst-case).
- Enforce moderation defaults (`moderation: auto`); surface error messaging when prompts are filtered. Offer fallback to `dall-e-3` for certain typography-heavy outputs if GPT Image struggles.
- Secure operations:
  - Queue requests via Convex action with per-user rate limits (see Section 5) to avoid hitting OpenAI rate caps.
  - Cache expensive results with Convex Action Cache component to minimize duplicate billing when revisiting variants.

### 4.3 Model Orchestration & Observability
- Implement a Convex `ai_jobs` table to track job status, provider, prompt, parameters, cost estimates, and output references.
- Provide a strategy selector (`auto`, `Gemini`, `OpenAI`) with heuristics: Gemini for edit consistency/background replacement, OpenAI for text rendering or multi-turn dialog.
- Log usage metrics and errors per provider; funnel into monitoring (e.g., Convex logs + external analytics) with alerting for elevated failure rates.

## 5. Convex Backend Architecture & Best Practices
- **Schema & indexing**: Design tables for `users`, `projects`, `canvases`, `layers`, `assets`, `ai_jobs`, `comments`. Define indexes for common queries (e.g., `by_project`, `by_canvas_and_createdAt`). Avoid using `.filter` on queries; rely on `.withIndex` or code-level filtering per Convex best practices doc.
- **Data access patterns**:
  - Use pagination for large collections instead of `.collect` to minimize bandwidth and reactivity churn.
  - Use helper modules (e.g., `convex/model`) so API functions remain thin wrappers; reuse logic across queries/mutations/actions.
- **Validation & security**:
  - Apply argument validators on all public `query`, `mutation`, and `action` endpoints.
  - Implement granular access control inside each public function (`ctx.auth.getUserIdentity()` checks, row-level enforcement).
  - Mark scheduled tasks, AI runners, and cross-function invocations as `internal.*` and only `run*` them internally to avoid public exposure.
- **Async hygiene**: Ensure all promises are awaited (use lint rule `no-floating-promises` as recommended).
- **Rate limiting & caching**: Adopt Convex components (Rate Limiter for per-user AI calls, Action Cache for AI result reuse, Workflows for long-running generation jobs).
- **Observability**: Persist operation logs/events and expose admin dashboards via Convex queries; integrate with third-party alerting if needed.

## 6. Asset Storage & Delivery with UploadThing
- **Upload pipeline** (per UploadThing uploading-files docs):
  1. Convex action returns presigned URL metadata: generate Sqids-based `fileKey`, build region-specific ingest URL, append query params (`expires`, `x-ut-*`), and sign with HMAC SHA256 using API key.
  2. Client uploads via PUT (FormData); support resumable uploads by honoring `x-ut-range-start` header and `Range` requests.
  3. Immediately register uploads through `/route-metadata` to ensure UploadThing can invoke callbacks (`callbackUrl`, `callbackSlug`, optional `awaitServerData` for blocking responses).
  4. Handle callback webhook: verify `x-uploadthing-signature`, inspect payload, run Convex internal handler to persist asset metadata, and optionally respond via `/callback-result` when awaiting server data.
- **Security**: Reject mismatched metadata (size/type) to prevent signature failures; store only file keys in Convex, never raw UploadThing API keys.
- **Server-side uploads**: Support Convex actions that ingest files from external sources, using `UTApi.uploadFiles` for validation before passing to UploadThing (no route registration needed).
- **Delivery**: Record CDN URLs and transformations; optionally integrate with edge image optimization (e.g., UploadThing to Cloudflare R2 component if needed later).

## 7. Frontend Application Blueprint
- **Framework**: Next.js App Router + React Server Components for data fetching; use Convex `useQuery`/`useMutation` hooks inside client components for realtime updates.
- **State management**: Canvas engine (Fabric.js, Konva, or custom WebGL) with local undo stack; sync saved states to Convex at checkpoints to avoid excessive traffic.
- **AI UX**: 
  - Prompt panel with dual provider toggles, parameter sliders (CFG, quality, size), and preview galleries.
  - Masking UI integrated with canvas layers; send mask + reference image to selected provider.
  - Streaming preview overlay for OpenAI partial images and future Gemini Live API.
- **Collaboration**: Represent presence via Convex Presence component; throttle updates to avoid flooding.
- **Accessibility & internationalization**: Keyboard shortcuts, WCAG contrast, localization-ready prompts.

## 8. Security, Compliance, & Operations
- **Secrets management**: Store provider API keys in Convex environment variables; never expose to client.
- **Auth**: Integrate with provider (Clerk/Auth0/custom) and map identities to Convex user records.
- **Content policy**: Combine OpenAI moderation, manual review flags, and optional Gemini grounding to reduce unsafe generations. Provide report/dispute tooling.
- **Auditability**: Log all AI prompts/results, uploads, edits, and exports with timestamps and actor IDs for compliance.
- **Performance**: Queue heavy tasks, offload long-running manipulations to Convex Workflows, and batch background exports.
- **Testing**: Write Convex integration tests for permission checks; contract tests for AI wrappers; end-to-end tests (Playwright) for upload + edit flows.

## 9. Implementation Roadmap
- **Phase 0 – Foundations (1–2 sprints)**: Project setup (Next.js + Convex + UploadThing), auth plumbing, minimal canvas, Convex schema + access control scaffolding, UploadThing upload/download path.
- **Phase 1 – AI Generation (2–3 sprints)**: Integrate Gemini Image basic prompt-to-image, store outputs, build gallery; add OpenAI Image API support with basic UI toggle; implement rate limiting & logging.
- **Phase 2 – AI Editing (3+ sprints)**: Masking tools, inpainting with Gemini, multi-turn edits via OpenAI Responses API, streaming previews, prompt revision surfacing.
- **Phase 3 – Collaboration & Scaling**: Presence, commenting, activity feed, background processing via Convex Workflows, caching of repeated AI jobs.
- **Phase 4 – Polish & Production Hardening**: Accessibility, cross-browser QA, telemetry dashboards, alerting, cost monitoring, CDN optimization, rollout automation.

### 9.1 Phase 0 Execution Plan (Current Focus)

| Workstream | Deliverables | Key Decisions & Notes | Dependencies |
| --- | --- | --- | --- |
| Project Scaffolding | Next.js (App Router) app in `apps/web`, shared `tsconfig`, ESLint + Prettier baseline, Tailwind or CSS-in-JS choice | Confirm monorepo (`pnpm` workspaces) vs single package; default to pnpm monorepo anticipating shared packages (UI, Convex client) | Node 18+, package manager availability |
| Convex Backend | Initialize Convex project in `convex/`, define initial schema tables (`users`, `projects`, `canvases`, `assets`), set up auth helpers, enforce lint rule `no-floating-promises` | Adopt `convex/model` helper pattern for business logic; prepare environment variable strategy for keys | Convex CLI access, auth provider selection |
| UploadThing Integration | Configure UploadThing API route stubs, presigned URL helper in Convex, client hook returning mock upload metadata | Ensure region + API key provisioning aligns with hosting assumption (Convex managed + Vercel) | UploadThing credentials, ops confirmation |
| Auth & Session | Integrate Clerk (`@clerk/nextjs`) with middleware-protected `/editor`, sign-in/up routes, and Convex identity mapping hooks | Provider chosen: Clerk (production). Implement Convex helpers to persist users post-auth | Clerk dashboard keys (publishable + secret) |
| Canvas MVP | Implement placeholder canvas layout (header/sidebar/canvas area), integrate simple Fabric.js/Konva stub component with local state | Document state separation between local canvas store and Convex-synced entities | None |
| DevOps & Tooling | `pnpm` scripts for `dev`, `lint`, `typecheck`; `.env.example`; `README` describing setup and Phase 0 goals | Align script naming with deployment target (Vercel) and add Convex dev server instructions | None |

**Definition of Done (Phase 0)**
- Repository runs local dev servers (`pnpm dev`) launching Next.js shell and Convex dev server with placeholder endpoints.
- Clerk authentication wired with middleware, sign-in/up routes, and session context available on the client.
- UploadThing helpers wired with environment placeholders and mocked upload flow returning deterministic fake URLs.
- Canvas route renders placeholder editor UI ready for AI integration workstreams.
- Documentation updated (`README`, `.env.example`) detailing setup, environment variables, and development scripts.

## 10. Open Questions & Proposed Resolutions
- Confirm whether “Nano Banana” should exclusively refer to Gemini Image or if additional Google AI tooling (e.g., Veo, Live API) is expected in scope.  
  **Proposed resolution:** Treat “Nano Banana” as Gemini Image-only for MVP; document Veo/Live API as stretch goals pending stakeholder confirmation.
- Clarify target hosting strategy (Vercel, custom) and any constraints around Convex regions or UploadThing regions.  
  **Proposed resolution:** Default to Convex-managed hosting + Vercel for the Next.js frontend; validate region compatibility (e.g., US vs EU) with ops lead.
- Define collaboration depth for MVP (view-only presence vs synchronous co-editing).  
  **Proposed resolution:** MVP delivers view-only presence and comment threads; schedule follow-up feasibility review for real-time co-editing once canvas stability is proven.
- Determine requirements for template marketplace, export automation, or third-party plugin ecosystem.  
  **Proposed resolution:** Defer marketplace/plugins to post-MVP; include automated export presets as part of Phase 2 if marketing requires it—await product directive.
- Specify compliance needs (GDPR, SOC2) and content moderation thresholds acceptable to stakeholders.  
  **Proposed resolution:** Assume GDPR baseline with data residency controls and document SOC2 as future requirement; legal/security to confirm moderation tolerance levels.
- Confirm budget limits for OpenAI/Gemini usage and whether cost-based throttling is required on day one.  
  **Proposed resolution:** Adopt provisional monthly cap (e.g., $2k combined) with soft alerts at 75%; finance to provide exact limits before Phase 1 launch.

## 11. Reference Documentation
- Google Gemini API Cookbook (2024): new Gemini 2.5 models, Gemini Image (“🍌 nano banana”), Live API, grounding, batch mode.  
  Source: https://github.com/google-gemini/cookbook/blob/main/README.md
- OpenAI Image Generation Guide (2024): GPT Image vs Image API, multi-turn edits, streaming partial images, cost model, moderation.  
  Source: https://platform.openai.com/docs/guides/image-generation?image-generation-model=gpt-image-1
- Convex Best Practices (2024): await promises, avoid `.filter`, limit `.collect`, validation, access control, helper modules, `internal.*` functions, rate limiting.  
  Source: https://github.com/get-convex/convex-backend/blob/main/npm-packages/docs/docs/understanding/best-practices/best-practices.mdx
- Convex Components Catalog (2024): Rate Limiter, Action Cache, Workflows, Presence, AI Agent scaffolding.  
  Source: https://www.convex.dev/components
- UploadThing Uploading Files Docs (2024): building backend adapter, Sqids-based file keys, presigned URLs, route registration, resumable uploads, webhook verification, server-side uploads.  
  Source: https://github.com/pingdotgg/uploadthing/blob/main/docs/src/app/(docs)/uploading-files/page.mdx
- Clerk Next.js SDK (2025): App Router quickstart, `ClerkProvider`, middleware route protection, and best practices for protected links.  
  Source: https://clerk.com/docs/nextjs/getting-started/quickstart and https://clerk.com/docs/reference/nextjs/clerk-middleware
