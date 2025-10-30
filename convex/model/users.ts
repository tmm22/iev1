/**
 * User Model Helpers
 * 
 * Business logic for user operations following Convex best practices.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function getUser(ctx: QueryCtx, userId: Id<"users">) {
  return await ctx.db.get(userId);
}

export async function getUserByAuthProvider(
  ctx: QueryCtx,
  authProviderId: string
) {
  return await ctx.db
    .query("users")
    .withIndex("by_auth_provider", (q) => q.eq("authProviderId", authProviderId))
    .first();
}

export async function updateUserLastSeen(
  ctx: MutationCtx,
  userId: Id<"users">
) {
  await ctx.db.patch(userId, {
    lastSeenAt: Date.now()
  });
}

export async function updateUserProfile(
  ctx: MutationCtx,
  userId: Id<"users">,
  updates: { name?: string; email?: string }
) {
  await ctx.db.patch(userId, updates);
}
