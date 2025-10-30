/**
 * Asset Model Helpers
 * 
 * Business logic for asset operations and UploadThing integration.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function getAsset(ctx: QueryCtx, assetId: Id<"assets">) {
  return await ctx.db.get(assetId);
}

export async function listAssetsByProject(
  ctx: QueryCtx,
  projectId: Id<"projects">,
  limit: number = 100
) {
  const assets = await ctx.db
    .query("assets")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .collect();
  
  return assets
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

export async function listAssetsByUser(
  ctx: QueryCtx,
  userId: Id<"users">,
  limit: number = 100
) {
  const assets = await ctx.db
    .query("assets")
    .withIndex("by_user", (q) => q.eq("createdBy", userId))
    .collect();
  
  return assets
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

export async function createAsset(
  ctx: MutationCtx,
  data: {
    projectId: Id<"projects">;
    createdBy: Id<"users">;
    name: string;
    uploadKey: string;
    provider: string;
    mimeType: string;
    size: number;
  }
) {
  return await ctx.db.insert("assets", {
    ...data,
    createdAt: Date.now()
  });
}

export async function deleteAsset(
  ctx: MutationCtx,
  assetId: Id<"assets">
) {
  await ctx.db.delete(assetId);
}

export async function getAssetByUploadKey(
  ctx: QueryCtx,
  uploadKey: string
) {
  // Note: This does a collection scan since we don't have an index on uploadKey
  // Consider adding an index if this query is frequent
  const assets = await ctx.db.query("assets").collect();
  return assets.find((asset) => asset.uploadKey === uploadKey);
}
