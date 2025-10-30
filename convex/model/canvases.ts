/**
 * Canvas Model Helpers
 * 
 * Business logic for canvas and canvas revision operations.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function getCanvas(ctx: QueryCtx, canvasId: Id<"canvases">) {
  return await ctx.db.get(canvasId);
}

export async function listCanvasesByProject(
  ctx: QueryCtx,
  projectId: Id<"projects">,
  limit: number = 50
) {
  const canvases = await ctx.db
    .query("canvases")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .collect();
  
  return canvases
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}

export async function createCanvas(
  ctx: MutationCtx,
  projectId: Id<"projects">,
  title: string
) {
  const now = Date.now();
  return await ctx.db.insert("canvases", {
    projectId,
    title,
    createdAt: now,
    updatedAt: now
  });
}

export async function updateCanvas(
  ctx: MutationCtx,
  canvasId: Id<"canvases">,
  updates: { title?: string; currentRevisionId?: Id<"canvasRevisions"> }
) {
  await ctx.db.patch(canvasId, {
    ...updates,
    updatedAt: Date.now()
  });
}

export async function deleteCanvas(
  ctx: MutationCtx,
  canvasId: Id<"canvases">
) {
  await ctx.db.delete(canvasId);
}

export async function createCanvasRevision(
  ctx: MutationCtx,
  canvasId: Id<"canvases">,
  snapshotKey: string
) {
  const canvas = await getCanvas(ctx, canvasId);
  if (!canvas) {
    throw new Error("Canvas not found");
  }
  
  // Get the latest revision number
  const latestRevision = await ctx.db
    .query("canvasRevisions")
    .withIndex("by_canvas", (q) => q.eq("canvasId", canvasId))
    .collect()
    .then((revisions) => 
      revisions.sort((a, b) => b.revisionNumber - a.revisionNumber)[0]
    );
  
  const revisionNumber = (latestRevision?.revisionNumber ?? 0) + 1;
  
  const revisionId = await ctx.db.insert("canvasRevisions", {
    canvasId,
    revisionNumber,
    snapshotKey,
    createdAt: Date.now()
  });
  
  // Update canvas to point to new revision
  await updateCanvas(ctx, canvasId, { currentRevisionId: revisionId });
  
  return revisionId;
}

export async function getCanvasRevisions(
  ctx: QueryCtx,
  canvasId: Id<"canvases">,
  limit: number = 10
) {
  const revisions = await ctx.db
    .query("canvasRevisions")
    .withIndex("by_canvas", (q) => q.eq("canvasId", canvasId))
    .collect();
  
  return revisions
    .sort((a, b) => b.revisionNumber - a.revisionNumber)
    .slice(0, limit);
}
