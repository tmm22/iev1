import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    authProviderId: v.string(),
    email: v.string(),
    name: v.string(),
    lastSeenAt: v.number()
  }).index("by_auth_provider", ["authProviderId"]),
  projects: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number()
  }).index("by_owner", ["ownerId"]),
  canvases: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    currentRevisionId: v.optional(v.id("canvasRevisions")),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_project", ["projectId"]),
  canvasRevisions: defineTable({
    canvasId: v.id("canvases"),
    revisionNumber: v.number(),
    snapshotKey: v.string(),
    createdAt: v.number()
  })
    .index("by_canvas", ["canvasId"])
    .index("by_canvas_revision", ["canvasId", "revisionNumber"]),
  assets: defineTable({
    projectId: v.id("projects"),
    createdBy: v.id("users"),
    name: v.string(),
    uploadKey: v.string(),
    provider: v.string(),
    mimeType: v.string(),
    size: v.number(),
    createdAt: v.number()
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["createdBy"]),
  ai_jobs: defineTable({
    userId: v.id("users"),
    projectId: v.id("projects"),
    canvasId: v.optional(v.id("canvases")),
    provider: v.union(v.literal("gemini"), v.literal("openai")),
    type: v.union(
      v.literal("generation"),
      v.literal("edit"),
      v.literal("multiTurn")
    ),
    prompt: v.string(),
    parameters: v.optional(v.string()),
    parentJobId: v.optional(v.id("ai_jobs")),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    result: v.optional(v.string()),
    error: v.optional(v.string()),
    costEstimate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number())
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
  uploadLogs: defineTable({
    userId: v.string(),
    fileKey: v.string(),
    fileName: v.string(),
    fileUrl: v.string(),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_user", ["userId"])
    .index("by_file_key", ["fileKey"])
});
