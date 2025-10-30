/**
 * Project Model Helpers
 * 
 * Business logic for project operations.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function getProject(ctx: QueryCtx, projectId: Id<"projects">) {
  return await ctx.db.get(projectId);
}

export async function listProjectsByOwner(
  ctx: QueryCtx,
  ownerId: Id<"users">,
  limit: number = 25
) {
  const projects = await ctx.db
    .query("projects")
    .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
    .collect();
  
  return projects
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

export async function createProject(
  ctx: MutationCtx,
  ownerId: Id<"users">,
  name: string,
  description?: string
) {
  const now = Date.now();
  return await ctx.db.insert("projects", {
    ownerId,
    name,
    description,
    createdAt: now
  });
}

export async function updateProject(
  ctx: MutationCtx,
  projectId: Id<"projects">,
  updates: { name?: string; description?: string }
) {
  await ctx.db.patch(projectId, updates);
}

export async function deleteProject(
  ctx: MutationCtx,
  projectId: Id<"projects">
) {
  await ctx.db.delete(projectId);
}

export async function verifyProjectOwnership(
  ctx: QueryCtx,
  projectId: Id<"projects">,
  userId: Id<"users">
): Promise<boolean> {
  const project = await getProject(ctx, projectId);
  return project?.ownerId === userId;
}
