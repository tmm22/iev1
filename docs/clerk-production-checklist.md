# Clerk Production Configuration Checklist

This checklist captures the settings required before deploying the AI Image Editor with Clerk authentication. It draws from Clerk’s Next.js App Router guidance (see [Quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart) and [Middleware reference](https://clerk.com/docs/reference/nextjs/clerk-middleware)).

## Core Environment Variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Publishable key scoped to the production instance and domain(s).
- `CLERK_SECRET_KEY`: Secret key for server-side helpers and middleware. Rotate via Clerk dashboard secrets.
- `CLERK_JWT_KEY` (recommended): JWKS public key enabling networkless token verification for server helpers.
- `CLERK_ENCRYPTION_KEY` (optional but recommended): 32-byte hex key to secure dynamic middleware options when providing `secretKey`.

## Allowed Origins & Redirects
- Set **Allowed origins / domains** in the Clerk dashboard to include:
  - Production domain (e.g., `https://editor.example.com`).
  - Vercel preview (if needed) with wildcard subdomain.
- Configure **Sign-in redirect URL** and **Sign-up redirect URL** to point to `/editor` or a post-auth onboarding route.
- For local development, add `http://localhost:3000` and ensure `.env` mirrors the dashboard settings.

## Middleware & Routing Considerations
- Keep `/`, `/sign-in`, `/sign-up` registered as public routes; all other routes default to `auth.protect()` via middleware (already implemented in `apps/web/middleware.ts`).
- Disable Next.js `Link` prefetch for protected routes (`prefetch={false}`) to avoid Clerk redirect errors (already applied on `/editor` link).
- If using multiple subdomains or custom tenant logic, supply `domain`/`proxyUrl` options inside `clerkMiddleware`.

## Session & Token Policies
- In the Clerk dashboard, adjust **Session duration** and **Idle timeout** to match product requirements (e.g., 30-day session, 12-hour idle).
- Enable **JWT templates** if Convex or other services will consume backend tokens; ensure claims include required metadata (user ID, org).
- Decide whether to allow **multi-session mode** (support for multiple signed-in tabs) or enforce single session for security.

## Audit & Security
- Enable Clerk **Email and SMS** verifications appropriate to the user base; enforce email verification before granting editor access.
- Configure **Breach detection & session inactivity** alerts.
- Export a **JSON backup** of instance settings and API keys as part of infra documentation.

## Deployment Checklist
1. Populate production environment variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, optional `CLERK_JWT_KEY`, `CLERK_ENCRYPTION_KEY`) in Vercel and Convex deployment settings.
2. Verify `/sign-in` and `/sign-up` routes render over HTTPS with the expected theme and redirect back to `/editor`.
3. Exercise middleware by visiting `/editor` while signed out; confirm redirect to Clerk hosted sign-in.
4. Validate server helpers (`auth()`, `currentUser()`) once Convex integration is in place.

Keep this checklist in sync with any policy or compliance updates. Document changes in the main README or ops runbook when the production configuration shifts. 
