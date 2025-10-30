/**
 * Convex Auth Helpers
 * 
 * Utilities for managing Clerk authentication integration with Convex.
 * Provides functions to retrieve or create user records based on Clerk identity.
 * 
 * IMPORTANT: Clients must call `ensureUser` mutation on app initialization
 * before making any queries that require authentication.
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
 * Gets an existing user record from Convex based on Clerk identity
 * For queries: Returns null if user doesn't exist (client should call ensureUser first)
 * For mutations: Creates the user if they don't exist
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx): Promise<Id<"users"> | null> {
  const identity = await getUserIdentity(ctx);
  
  // Try to find existing user by Clerk auth provider ID
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_auth_provider", (q) => q.eq("authProviderId", identity.subject))
    .first();
  
  if (existingUser) {
    // Update last seen timestamp only in mutation context
    if ("patch" in ctx.db) {
      await ctx.db.patch(existingUser._id, {
        lastSeenAt: Date.now()
      });
    }
    return existingUser._id;
  }
  
  // Create new user only in mutation context
  if ("insert" in ctx.db) {
    const userId = await ctx.db.insert("users", {
      authProviderId: identity.subject,
      email: identity.email ?? `user-${identity.subject}@example.com`,
      name: identity.name ?? "Unknown User",
      lastSeenAt: Date.now()
    });
    return userId;
  }
  
  // In query context, return null if user doesn't exist
  // Client should have called ensureUser mutation first
  return null;
}

/**
 * Requires authentication and returns the current user ID
 * Throws if the user is not authenticated or doesn't exist in database
 * 
 * Use this in queries after the client has called ensureUser
 */
export async function requireUser(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const userId = await getCurrentUser(ctx);
  if (!userId) {
    throw new Error(
      "User record not found. Client must call ensureUser mutation on initialization."
    );
  }
  return userId;
}

/**
 * Gets user ID if authenticated and exists, returns null otherwise
 * Safe to use in queries - won't throw if user hasn't been created yet
 */
export async function getOptionalUser(ctx: QueryCtx | MutationCtx): Promise<Id<"users"> | null> {
  try {
    return await getCurrentUser(ctx);
  } catch {
    return null;
  }
}
