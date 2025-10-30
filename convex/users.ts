/**
 * User API Functions
 * 
 * Public queries and mutations for user operations.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, requireUser } from "./auth";
import * as userModel from "./model/users";

/**
 * Ensure the current user exists in the database
 * 
 * CRITICAL: Call this mutation on app initialization before making any queries.
 * This creates the user record if it doesn't exist, allowing subsequent queries to work.
 * 
 * Returns the user ID if successful.
 */
export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    // getCurrentUser in mutation context will create the user if needed
    const userId = await getCurrentUser(ctx);
    if (!userId) {
      throw new Error("Failed to create or retrieve user");
    }
    return userId;
  }
});

/**
 * Get the current authenticated user
 * 
 * Requires that ensureUser has been called first.
 */
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    return await userModel.getUser(ctx, userId);
  }
});

/**
 * Update the current user's profile
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    await userModel.updateUserProfile(ctx, userId, args);
  }
});
