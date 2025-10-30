/**
 * Asset API Functions
 * 
 * Public queries and mutations for asset operations.
 * Handles promotion of UploadThing logs to canonical assets.
 */

import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";
import * as projectModel from "./model/projects";
import * as assetModel from "./model/assets";

/**
 * List all assets in a project
 */
export const listAssets = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const hasAccess = await projectModel.verifyProjectOwnership(
      ctx,
      args.projectId,
      userId
    );
    
    if (!hasAccess) {
      throw new Error("Access denied");
    }
    
    return await assetModel.listAssetsByProject(ctx, args.projectId, args.limit);
  }
});

/**
 * List all assets created by the current user
 */
export const listMyAssets = query({
  args: {
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    return await assetModel.listAssetsByUser(ctx, userId, args.limit);
  }
});

/**
 * Get a single asset by ID
 */
export const getAsset = query({
  args: {
    assetId: v.id("assets")
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const asset = await assetModel.getAsset(ctx, args.assetId);
    
    if (!asset) {
      throw new Error("Asset not found");
    }
    
    const hasAccess = await projectModel.verifyProjectOwnership(
      ctx,
      asset.projectId,
      userId
    );
    
    if (!hasAccess) {
      throw new Error("Access denied");
    }
    
    return asset;
  }
});

/**
 * Promote an UploadThing upload log to a canonical asset
 * Links the upload to a project and user
 */
export const promoteUploadToAsset = mutation({
  args: {
    projectId: v.id("projects"),
    fileKey: v.string(),
    name: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const hasAccess = await projectModel.verifyProjectOwnership(
      ctx,
      args.projectId,
      userId
    );
    
    if (!hasAccess) {
      throw new Error("Access denied");
    }
    
    // Find the upload log entry
    const uploadLog = await ctx.db
      .query("uploadLogs")
      .withIndex("by_file_key", (q) => q.eq("fileKey", args.fileKey))
      .first();
    
    if (!uploadLog) {
      throw new Error("Upload log not found");
    }
    
    // Check if already promoted
    const existing = await assetModel.getAssetByUploadKey(ctx, args.fileKey);
    if (existing) {
      return existing._id;
    }
    
    // Create canonical asset record
    return await assetModel.createAsset(ctx, {
      projectId: args.projectId,
      createdBy: userId,
      name: args.name ?? uploadLog.fileName,
      uploadKey: args.fileKey,
      provider: "uploadthing",
      mimeType: uploadLog.fileType ?? "application/octet-stream",
      size: uploadLog.fileSize ?? 0
    });
  }
});

/**
 * Internal mutation to auto-promote uploads with project context
 * Called by UploadThing webhooks when projectId is known
 */
export const autoPromoteUpload = internalMutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
    fileKey: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number()
  },
  handler: async (ctx, args) => {
    // Check if already promoted
    const existing = await assetModel.getAssetByUploadKey(ctx, args.fileKey);
    if (existing) {
      return existing._id;
    }
    
    return await assetModel.createAsset(ctx, {
      projectId: args.projectId,
      createdBy: args.userId,
      name: args.fileName,
      uploadKey: args.fileKey,
      provider: "uploadthing",
      mimeType: args.fileType,
      size: args.fileSize
    });
  }
});

/**
 * Delete an asset
 */
export const deleteAsset = mutation({
  args: {
    assetId: v.id("assets")
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const asset = await assetModel.getAsset(ctx, args.assetId);
    
    if (!asset) {
      throw new Error("Asset not found");
    }
    
    const hasAccess = await projectModel.verifyProjectOwnership(
      ctx,
      asset.projectId,
      userId
    );
    
    if (!hasAccess) {
      throw new Error("Access denied");
    }
    
    await assetModel.deleteAsset(ctx, args.assetId);
  }
});
