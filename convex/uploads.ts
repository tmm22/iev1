import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const recordUpload = internalMutation({
  args: {
    userId: v.string(),
    fileKey: v.string(),
    fileName: v.string(),
    fileUrl: v.string(),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    metadata: v.optional(v.any())
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("uploadLogs")
      .withIndex("by_file_key", (q) => q.eq("fileKey", args.fileKey))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        fileName: args.fileName,
        fileUrl: args.fileUrl,
        updatedAt: now,
        ...(args.fileType !== undefined ? { fileType: args.fileType } : {}),
        ...(args.fileSize !== undefined ? { fileSize: args.fileSize } : {}),
        ...(args.metadata !== undefined ? { metadata: args.metadata } : {})
      });
      return existing._id;
    }

    await ctx.db.insert("uploadLogs", {
      userId: args.userId,
      fileKey: args.fileKey,
      fileName: args.fileName,
      fileUrl: args.fileUrl,
      createdAt: now,
      updatedAt: now,
      ...(args.fileType !== undefined ? { fileType: args.fileType } : {}),
      ...(args.fileSize !== undefined ? { fileSize: args.fileSize } : {}),
      ...(args.metadata !== undefined ? { metadata: args.metadata } : {})
    });
  }
});
