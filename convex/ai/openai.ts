/**
 * OpenAI GPT Image Integration
 * Following OpenAI Image Generation Guide for GPT Image API
 */

import { v } from "convex/values";
import { internalAction, internalMutation } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// Types for OpenAI API responses
interface OpenAIGenerationResponse {
  imageUrl: string;
  imageId?: string;
  revisedPrompt?: string;
  metadata: {
    model: string;
    timestamp: number;
    tokensUsed?: number;
    quality?: string;
    size?: string;
  };
}

interface OpenAIMultiTurnResponse extends OpenAIGenerationResponse {
  previousResponseId?: string;
  conversationContext?: string[];
}

// Internal action for OpenAI image generation
export const generateImage = internalAction({
  args: {
    prompt: v.string(),
    jobId: v.id("ai_jobs"),
    userId: v.id("users"),
    parameters: v.optional(v.object({
      quality: v.optional(v.union(v.literal("standard"), v.literal("hd"))),
      size: v.optional(v.union(
        v.literal("1024x1024"),
        v.literal("1792x1024"),
        v.literal("1024x1792")
      )),
      style: v.optional(v.union(v.literal("vivid"), v.literal("natural"))),
      n: v.optional(v.number()),
      responseFormat: v.optional(v.union(v.literal("url"), v.literal("b64_json"))),
    })),
  },
  handler: async (ctx, args) => {
    const { prompt, jobId, parameters } = args;
    
    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    try {
      // Update job status to processing
      await ctx.runMutation(internal.ai.openai.updateJobStatus, {
        jobId,
        status: "processing",
      });

      // TODO: Replace with actual OpenAI API call
      // For Phase 1 MVP, using mock implementation

      // Mock response for development
      const mockResponse: OpenAIGenerationResponse = {
        imageUrl: `https://via.placeholder.com/1024x1024?text=${encodeURIComponent(prompt.slice(0, 20))}`,
        imageId: `img_${Date.now()}`,
        revisedPrompt: `Optimized prompt: ${prompt} with enhanced details`,
        metadata: {
          model: "gpt-image-1",
          timestamp: Date.now(),
          tokensUsed: Math.floor(Math.random() * 2000) + 200,
          quality: parameters?.quality || "standard",
          size: parameters?.size || "1024x1024",
        },
      };

      // Calculate cost estimate based on quality and size
      const costEstimate = calculateOpenAICost(
        parameters?.quality || "standard",
        parameters?.size || "1024x1024"
      );

      // Store the result
      await ctx.runMutation(internal.ai.openai.storeGenerationResult, {
        jobId,
        result: mockResponse,
        costEstimate,
      });

      return mockResponse;
    } catch (error) {
      // Update job status to failed
      await ctx.runMutation(internal.ai.openai.updateJobStatus, {
        jobId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  },
});

// Internal action for multi-turn conversational editing
export const multiTurnEdit = internalAction({
  args: {
    prompt: v.string(),
    jobId: v.id("ai_jobs"),
    userId: v.id("users"),
    previousResponseId: v.optional(v.string()),
    imageIds: v.optional(v.array(v.string())),
    conversationHistory: v.optional(v.array(v.string())),
    parameters: v.optional(v.object({
      partialImages: v.optional(v.number()),
      temperature: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const { prompt, jobId, previousResponseId, imageIds, conversationHistory, parameters } = args;
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    try {
      // Update job status
      await ctx.runMutation(internal.ai.openai.updateJobStatus, {
        jobId,
        status: "processing",
      });

      // TODO: Implement actual OpenAI Responses API call

      // Mock response for development
      const mockResponse: OpenAIMultiTurnResponse = {
        imageUrl: `https://via.placeholder.com/1024x1024?text=${encodeURIComponent(`Edited: ${prompt.slice(0, 15)}`)}`,
        imageId: `img_${Date.now()}`,
        revisedPrompt: `Multi-turn edit: ${prompt}`,
        previousResponseId,
        conversationContext: [...(conversationHistory || []), prompt],
        metadata: {
          model: "gpt-image-1",
          timestamp: Date.now(),
          tokensUsed: Math.floor(Math.random() * 1500) + 300,
          quality: "standard",
          size: "1024x1024",
        },
      };

      // Store the result
      await ctx.runMutation(internal.ai.openai.storeGenerationResult, {
        jobId,
        result: mockResponse,
        costEstimate: 0.04,
      });

      return mockResponse;
    } catch (error) {
      await ctx.runMutation(internal.ai.openai.updateJobStatus, {
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
    costEstimate: v.number(),
  },
  handler: async (ctx, args) => {
    const { jobId, result, costEstimate } = args;
    
    await ctx.db.patch(jobId, {
      status: "completed",
      result: JSON.stringify(result),
      completedAt: Date.now(),
      updatedAt: Date.now(),
      costEstimate,
    });
  },
});

// Helper function to calculate OpenAI cost based on quality and size
function calculateOpenAICost(quality: string, size: string): number {
  // OpenAI pricing (as of 2024)
  const pricing: Record<string, Record<string, number>> = {
    standard: {
      "1024x1024": 0.040,
      "1792x1024": 0.080,
      "1024x1792": 0.080,
    },
    hd: {
      "1024x1024": 0.080,
      "1792x1024": 0.120,
      "1024x1792": 0.120,
    },
  };
  
  return pricing[quality]?.[size] || 0.040;
}

const internal = {
  ai: {
    openai: {
      generateImage,
      multiTurnEdit,
      updateJobStatus,
      storeGenerationResult,
    },
  },
};
