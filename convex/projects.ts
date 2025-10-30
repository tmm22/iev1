/**
 * Project API Functions
 * 
 * Public queries and mutations for project operations.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";
import * as projectModel from "./model/projects";

/**
 * List all projects owned by the current user
 */
export const listMyProjects = query({
  args: {
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    return await projectModel.listProjectsByOwner(ctx, userId, args.limit);
  }
});

/**
 * Get a single project by ID
 */
export const getProject = query({
  args: {
    projectId: v.id("projects")
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const project = await projectModel.getProject(ctx, args.projectId);
    
    if (!project || project.ownerId !== userId) {
      throw new Error("Project not found or access denied");
    }
    
    return project;
  }
});

/**
 * Create a new project
 */
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    return await projectModel.createProject(
      ctx,
      userId,
      args.name,
      args.description
    );
  }
});

/**
 * Update a project
 */
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string())
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
    
    const { projectId, ...updates } = args;
    await projectModel.updateProject(ctx, projectId, updates);
  }
});

/**
 * Delete a project
 */
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects")
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
    
    await projectModel.deleteProject(ctx, args.projectId);
  }
});
