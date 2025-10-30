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
 * Get the current authenticated user
 */
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUser(ctx);
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
