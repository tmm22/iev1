/**
 * Canvas API Functions
 * 
 * Public queries and mutations for canvas operations.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";
import * as projectModel from "./model/projects";
import * as canvasModel from "./model/canvases";

/**
 * List all canvases in a project
 */
export const listCanvases = query({
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
    
    return await canvasModel.listCanvasesByProject(ctx, args.projectId, args.limit);
  }
});

/**
 * Get a single canvas by ID
 */
export const getCanvas = query({
  args: {
    canvasId: v.id("canvases")
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const canvas = await canvasModel.getCanvas(ctx, args.canvasId);
    
    if (!canvas) {
      throw new Error("Canvas not found");
    }
    
    const hasAccess = await projectModel.verifyProjectOwnership(
      ctx,
      canvas.projectId,
      userId
    );
    
    if (!hasAccess) {
      throw new Error("Access denied");
    }
    
    return canvas;
  }
});

/**
 * Create a new canvas
 */
export const createCanvas = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string()
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
    
    return await canvasModel.createCanvas(ctx, args.projectId, args.title);
  }
});

/**
 * Update a canvas
 */
export const updateCanvas = mutation({
  args: {
    canvasId: v.id("canvases"),
    title: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const canvas = await canvasModel.getCanvas(ctx, args.canvasId);
    
    if (!canvas) {
      throw new Error("Canvas not found");
    }
    
    const hasAccess = await projectModel.verifyProjectOwnership(
      ctx,
      canvas.projectId,
      userId
    );
    
    if (!hasAccess) {
      throw new Error("Access denied");
    }
    
    const { canvasId, ...updates } = args;
    await canvasModel.updateCanvas(ctx, canvasId, updates);
  }
});

/**
 * Delete a canvas
 */
export const deleteCanvas = mutation({
  args: {
    canvasId: v.id("canvases")
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const canvas = await canvasModel.getCanvas(ctx, args.canvasId);
    
    if (!canvas) {
      throw new Error("Canvas not found");
    }
    
    const hasAccess = await projectModel.verifyProjectOwnership(
      ctx,
      canvas.projectId,
      userId
    );
    
    if (!hasAccess) {
      throw new Error("Access denied");
    }
    
    await canvasModel.deleteCanvas(ctx, args.canvasId);
  }
});

/**
 * Create a canvas revision (snapshot)
 */
export const createRevision = mutation({
  args: {
    canvasId: v.id("canvases"),
    snapshotKey: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const canvas = await canvasModel.getCanvas(ctx, args.canvasId);
    
    if (!canvas) {
      throw new Error("Canvas not found");
    }
    
    const hasAccess = await projectModel.verifyProjectOwnership(
      ctx,
      canvas.projectId,
      userId
    );
    
    if (!hasAccess) {
      throw new Error("Access denied");
    }
    
    return await canvasModel.createCanvasRevision(
      ctx,
      args.canvasId,
      args.snapshotKey
    );
  }
});

/**
 * Get canvas revision history
 */
export const getRevisions = query({
  args: {
    canvasId: v.id("canvases"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const canvas = await canvasModel.getCanvas(ctx, args.canvasId);
    
    if (!canvas) {
      throw new Error("Canvas not found");
    }
    
    const hasAccess = await projectModel.verifyProjectOwnership(
      ctx,
      canvas.projectId,
      userId
    );
    
    if (!hasAccess) {
      throw new Error("Access denied");
    }
    
    return await canvasModel.getCanvasRevisions(ctx, args.canvasId, args.limit);
  }
});
