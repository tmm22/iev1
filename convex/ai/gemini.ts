/**
 * Google Gemini Image ("Nano Banana") Integration
 * Following Gemini API Cookbook guidance for image generation/editing
 */

import { v } from "convex/values";
import { internalAction, internalMutation } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// Types for Gemini API responses
interface GeminiGenerationResponse {
  imageUrl: string;
  revisedPrompt?: string;
  metadata: {
    model: string;
    timestamp: number;
    tokensUsed?: number;
  };
}

interface GeminiEditResponse extends GeminiGenerationResponse {
  editType: "mask" | "style" | "background" | "inpaint";
}

// Internal action for Gemini image generation
export const generateImage = internalAction({
  args: {
    prompt: v.string(),
    jobId: v.id("ai_jobs"),
    userId: v.id("users"),
    parameters: v.optional(v.object({
      quality: v.optional(v.string()),
      size: v.optional(v.string()),
      style: v.optional(v.string()),
      negativePrompt: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const { prompt, jobId, parameters } = args;
    
    // Get API key from environment
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY not configured");
    }

    try {
      // Update job status to processing
      await ctx.runMutation(internal.ai.gemini.updateJobStatus, {
        jobId,
        status: "processing",
      });

      // TODO: Replace with actual Gemini API call
      // For Phase 1 MVP, using mock implementation

      // Mock response for development
      const mockResponse: GeminiGenerationResponse = {
        imageUrl: `https://via.placeholder.com/512x512?text=${encodeURIComponent(prompt.slice(0, 20))}`,
        revisedPrompt: `Enhanced prompt: ${prompt} with improved clarity and detail`,
        metadata: {
          model: "gemini-pro-vision",
          timestamp: Date.now(),
          tokensUsed: Math.floor(Math.random() * 1000) + 100,
        },
      };

      // Store the result
      await ctx.runMutation(internal.ai.gemini.storeGenerationResult, {
        jobId,
        result: mockResponse,
      });

      return mockResponse;
    } catch (error) {
      // Update job status to failed
      await ctx.runMutation(internal.ai.gemini.updateJobStatus, {
        jobId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  },
});

// Internal action for Gemini image editing
export const editImage = internalAction({
  args: {
    imageUrl: v.string(),
    prompt: v.string(),
    jobId: v.id("ai_jobs"),
    userId: v.id("users"),
    editType: v.union(
      v.literal("mask"),
      v.literal("style"),
      v.literal("background"),
      v.literal("inpaint")
    ),
    mask: v.optional(v.string()),
    parameters: v.optional(v.object({
      strength: v.optional(v.number()),
      guidanceScale: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const { imageUrl, prompt, jobId, editType, mask, parameters } = args;
    
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY not configured");
    }

    try {
      // Update job status
      await ctx.runMutation(internal.ai.gemini.updateJobStatus, {
        jobId,
        status: "processing",
      });

      // TODO: Implement actual Gemini Image-to-Image editing

      // Mock response for development
      const mockResponse: GeminiEditResponse = {
        imageUrl: `https://via.placeholder.com/512x512?text=${encodeURIComponent(`Edited: ${prompt.slice(0, 15)}`)}`,
        revisedPrompt: `Applied ${editType} edit: ${prompt}`,
        editType,
        metadata: {
          model: "gemini-pro-vision",
          timestamp: Date.now(),
          tokensUsed: Math.floor(Math.random() * 500) + 50,
        },
      };

      // Store the result
      await ctx.runMutation(internal.ai.gemini.storeGenerationResult, {
        jobId,
        result: mockResponse,
      });

      return mockResponse;
    } catch (error) {
      await ctx.runMutation(internal.ai.gemini.updateJobStatus, {
        jobId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  },
});

// Internal mutation to update job status
export const updateJobStatus = internalMutation({
  args: {
    jobId: v.id("ai_jobs"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { jobId, status, error } = args;
    
    await ctx.db.patch(jobId, {
      status,
      error,
      updatedAt: Date.now(),
      ...(status === "completed" ? { completedAt: Date.now() } : {}),
    });
  },
});

// Internal mutation to store generation results
export const storeGenerationResult = internalMutation({
  args: {
    jobId: v.id("ai_jobs"),
    result: v.any(),
  },
  handler: async (ctx, args) => {
    const { jobId, result } = args;
    
    await ctx.db.patch(jobId, {
      status: "completed",
      result: JSON.stringify(result),
      completedAt: Date.now(),
      updatedAt: Date.now(),
      costEstimate: calculateCostEstimate(result),
    });
  },
});

// Helper function to calculate cost estimates
function calculateCostEstimate(result: any): number {
  const tokensUsed = result.metadata?.tokensUsed || 0;
  const costPerThousandTokens = 0.001;
  return (tokensUsed / 1000) * costPerThousandTokens;
}

const internal = {
  ai: {
    gemini: {
      generateImage,
      editImage,
      updateJobStatus,
      storeGenerationResult,
    },
  },
};
