# Convex Authentication Setup

## User Initialization Pattern

The Convex backend requires that user records be created via a **mutation** before any queries can access them. This is because queries are read-only and cannot create database records.

### The Problem

When a new user signs in with Clerk for the first time:
1. Clerk authenticates them
2. The frontend tries to fetch their data with a query (e.g., `listMyProjects`)
3. The query calls `requireUser()` which looks for the user in the database
4. **The user doesn't exist yet** → query fails ❌

### The Solution

Call the `ensureUser` mutation on app initialization:

```typescript
// apps/web/lib/convex/useEnsureUser.ts
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useEnsureUser() {
  const { isSignedIn } = useUser();
  const ensureUser = useMutation(api.users.ensureUser);

  useEffect(() => {
    if (isSignedIn) {
      ensureUser(); // Creates user if doesn't exist
    }
  }, [isSignedIn]);
}
```

### Usage in App

Add to your root layout or authenticated wrapper:

```typescript
// apps/web/app/layout.tsx or apps/web/components/AuthWrapper.tsx
import { useEnsureUser } from "@/lib/convex/useEnsureUser";

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, error } = useEnsureUser();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <>{children}</>;
}
```

## How It Works

### `ensureUser` Mutation
```typescript
// convex/users.ts
export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUser(ctx);
    return userId; // Will create user if doesn't exist
  }
});
```

### `getCurrentUser` Helper
```typescript
// convex/auth.ts
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await getUserIdentity(ctx);
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_auth_provider", q => q.eq("authProviderId", identity.subject))
    .first();

  if (existingUser) return existingUser._id;

  // ✅ In mutation context: create user
  if ("insert" in ctx.db) {
    return await ctx.db.insert("users", { /* ... */ });
  }

  // ❌ In query context: return null (user should have called ensureUser first)
  return null;
}
```

### `requireUser` Helper
```typescript
// convex/auth.ts
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getCurrentUser(ctx);
  if (!userId) {
    throw new Error("User record not found. Client must call ensureUser mutation on initialization.");
  }
  return userId;
}
```

## Best Practices

1. **Call `ensureUser` once** on app mount or after Clerk authentication
2. **Don't call `ensureUser` repeatedly** - it's idempotent but adds unnecessary overhead
3. **Handle loading states** while `ensureUser` is running
4. **Show error states** if `ensureUser` fails (network issues, etc.)
5. **All queries** can safely use `requireUser()` after `ensureUser` completes

## Error Handling

If you see this error:
```
User record not found. Client must call ensureUser mutation on initialization.
```

**Solution**: Make sure `useEnsureUser()` is called before any Convex queries run.

## Alternative Patterns

### Option 1: Ensure on Every Mutation (Current Implementation)
- Pro: Automatic, no client setup needed
- Con: Queries fail for new users until first mutation

### Option 2: Dedicated Initialization Mutation (Recommended)
- Pro: Explicit, predictable, queries work immediately after
- Con: Requires client-side setup
- **This is what we implemented** ✅

### Option 3: Optional User Pattern
- Use `getOptionalUser()` in queries that should work for unauthenticated users
- Return empty arrays/null for missing users
- Pro: Graceful degradation
- Con: Less secure, harder to reason about
