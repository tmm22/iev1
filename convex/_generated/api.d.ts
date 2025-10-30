/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_gemini from "../ai/gemini.js";
import type * as ai_openai from "../ai/openai.js";
import type * as aiJobs from "../aiJobs.js";
import type * as assets from "../assets.js";
import type * as auth from "../auth.js";
import type * as canvases from "../canvases.js";
import type * as model_assets from "../model/assets.js";
import type * as model_canvases from "../model/canvases.js";
import type * as model_projects from "../model/projects.js";
import type * as model_users from "../model/users.js";
import type * as projects from "../projects.js";
import type * as uploads from "../uploads.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "ai/gemini": typeof ai_gemini;
  "ai/openai": typeof ai_openai;
  aiJobs: typeof aiJobs;
  assets: typeof assets;
  auth: typeof auth;
  canvases: typeof canvases;
  "model/assets": typeof model_assets;
  "model/canvases": typeof model_canvases;
  "model/projects": typeof model_projects;
  "model/users": typeof model_users;
  projects: typeof projects;
  uploads: typeof uploads;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
