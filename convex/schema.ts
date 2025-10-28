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
  aiJobs: defineTable({
    projectId: v.id("projects"),
    requestedBy: v.id("users"),
    provider: v.string(),
    status: v.string(),
    prompt: v.string(),
    responseKey: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    costUsd: v.optional(v.number())
  }).index("by_project", ["projectId"])
});
