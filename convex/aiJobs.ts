/**
 * AI Jobs Management
 * Handles creation, tracking, and orchestration of AI generation/editing jobs
 */

import { v } from "convex/values";
import { mutation, query, action, internalAction, internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { requireUser } from "./auth";

// Create a new AI job
export const createJob = mutation({
  args: {
    projectId: v.id("projects"),
    canvasId: v.optional(v.id("canvases")),
    provider: v.union(v.literal("gemini"), v.literal("openai")),
    type: v.union(
      v.literal("generation"),
      v.literal("edit"),
      v.literal("multiTurn")
    ),
    prompt: v.string(),
    parameters: v.optional(v.any()),
    parentJobId: v.optional(v.id("ai_jobs")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const { projectId, canvasId, provider, type, prompt, parameters, parentJobId } = args;
    
    // Verify project ownership
    const project = await ctx.db.get(projectId);
    if (!project || project.ownerId !== user._id) {
      throw new Error("Project not found or unauthorized");
    }
    
    // Create the AI job
    const jobId = await ctx.db.insert("ai_jobs", {
      userId: user._id,
      projectId,
      canvasId,
      provider,
      type,
      prompt,
      parameters: JSON.stringify(parameters || {}),
      parentJobId,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return jobId;
  },
});

// Query AI jobs for a project
export const getProjectJobs = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    )),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const { projectId, limit = 50, status } = args;
    
    // Verify project ownership
    const project = await ctx.db.get(projectId);
    if (!project || project.ownerId !== user._id) {
      return [];
    }
    
    // Query jobs with optional status filter
    let query = ctx.db
      .query("ai_jobs")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc");
    
    const jobs = await query.take(limit);
    
    // Filter by status if provided
    const filteredJobs = status 
      ? jobs.filter(job => job.status === status)
      : jobs;
    
    return filteredJobs;
  },
});

// Get a specific AI job
export const getJob = query({
  args: {
    jobId: v.id("ai_jobs"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const job = await ctx.db.get(args.jobId);
    
    if (!job || job.userId !== user._id) {
      return null;
    }
    
    return job;
  },
});

// Main action to generate an image with the selected provider
export const generateImage = action({
  args: {
    projectId: v.id("projects"),
    canvasId: v.optional(v.id("canvases")),
    provider: v.union(v.literal("gemini"), v.literal("openai")),
    prompt: v.string(),
    parameters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { projectId, canvasId, provider, prompt, parameters } = args;
    
    // Create the job entry
    const jobId = await ctx.runMutation(internal.aiJobs.createJob, {
      projectId,
      canvasId,
      provider,
      type: "generation",
      prompt,
      parameters,
    });
    
    // Get user ID for internal actions
    const job = await ctx.runQuery(internal.aiJobs.getJob, { jobId });
    if (!job) {
      throw new Error("Failed to create job");
    }
    
    // Route to the appropriate provider
    if (provider === "gemini") {
      const result = await ctx.runAction(internal.ai.gemini.generateImage, {
        prompt,
        jobId,
        userId: job.userId,
        parameters,
      });
      return { jobId, result };
    } else if (provider === "openai") {
      const result = await ctx.runAction(internal.ai.openai.generateImage, {
        prompt,
        jobId,
        userId: job.userId,
        parameters,
      });
      return { jobId, result };
    }
    
    throw new Error(`Unsupported provider: ${provider}`);
  },
});

// Query to get job statistics for cost tracking
export const getJobStats = query({
  args: {
    projectId: v.id("projects"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const { projectId, startDate, endDate } = args;
    
    // Verify project ownership
    const project = await ctx.db.get(projectId);
    if (!project || project.ownerId !== user._id) {
      return null;
    }
    
    // Get all jobs for the project
    const jobs = await ctx.db
      .query("ai_jobs")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    
    // Filter by date range if provided
    const filteredJobs = jobs.filter(job => {
      if (startDate && job.createdAt < startDate) return false;
      if (endDate && job.createdAt > endDate) return false;
      return true;
    });
    
    // Calculate statistics
    const stats = {
      totalJobs: filteredJobs.length,
      completedJobs: filteredJobs.filter(j => j.status === "completed").length,
      failedJobs: filteredJobs.filter(j => j.status === "failed").length,
      totalCost: filteredJobs.reduce((sum, job) => sum + (job.costEstimate || 0), 0),
      byProvider: {
        gemini: filteredJobs.filter(j => j.provider === "gemini").length,
        openai: filteredJobs.filter(j => j.provider === "openai").length,
      },
      byType: {
        generation: filteredJobs.filter(j => j.type === "generation").length,
        edit: filteredJobs.filter(j => j.type === "edit").length,
        multiTurn: filteredJobs.filter(j => j.type === "multiTurn").length,
      },
    };
    
    return stats;
  },
});

// Internal exports
export const internal = {
  aiJobs: {
    createJob,
    getJob,
  },
  ai: {
    gemini: {
      generateImage: internalAction({
        args: {
          prompt: v.string(),
          jobId: v.id("ai_jobs"),
          userId: v.id("users"),
          parameters: v.optional(v.any()),
        },
        handler: async () => {
          // Placeholder - actual implementation in convex/ai/gemini.ts
          throw new Error("Not implemented");
        },
      }),
    },
    openai: {
      generateImage: internalAction({
        args: {
          prompt: v.string(),
          jobId: v.id("ai_jobs"),
          userId: v.id("users"),
          parameters: v.optional(v.any()),
        },
        handler: async () => {
          // Placeholder - actual implementation in convex/ai/openai.ts
          throw new Error("Not implemented");
        },
      }),
    },
  },
};
