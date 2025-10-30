/**
 * Convex Auth Helpers
 * 
 * Utilities for managing Clerk authentication integration with Convex.
 * Provides functions to retrieve or create user records based on Clerk identity.
 */

import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Gets the authenticated user's identity from Clerk via Convex auth context
 */
export async function getUserIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated: No user identity found");
  }
  return identity;
}

/**
 * Gets or creates a user record in Convex based on Clerk identity
 * Returns the user ID from the Convex users table
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const identity = await getUserIdentity(ctx);
  
  // Try to find existing user by Clerk auth provider ID
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_auth_provider", (q) => q.eq("authProviderId", identity.subject))
    .first();
  
  if (existingUser) {
    // Update last seen timestamp
    if ("patch" in ctx.db) {
      await ctx.db.patch(existingUser._id, {
        lastSeenAt: Date.now()
      });
    }
    return existingUser._id;
  }
  
  // Create new user if not found
  if (!("insert" in ctx.db)) {
    throw new Error("Cannot create user in query context");
  }
  
  const userId = await ctx.db.insert("users", {
    authProviderId: identity.subject,
    email: identity.email ?? `user-${identity.subject}@example.com`,
    name: identity.name ?? "Unknown User",
    lastSeenAt: Date.now()
  });
  
  return userId;
}

/**
 * Requires authentication and returns the current user ID
 * Throws if the user is not authenticated
 */
export async function requireUser(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  return await getCurrentUser(ctx);
}

/**
 * Gets user ID if authenticated, returns null otherwise
 */
export async function getOptionalUser(ctx: QueryCtx | MutationCtx): Promise<Id<"users"> | null> {
  try {
    return await getCurrentUser(ctx);
  } catch {
    return null;
  }
}
