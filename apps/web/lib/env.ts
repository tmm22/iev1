import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_CONVEX_URL: z.string().url().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1)
});

const serverSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(10),
  CLERK_JWT_KEY: z.string().optional(),
  CLERK_ENCRYPTION_KEY: z.string().optional(),
  UPLOADTHING_TOKEN: z.string(),
  CONVEX_DEPLOYMENT: z.string(),
  CONVEX_AUTH_SECRET: z.string(),
  OPENAI_API_KEY: z.string(),
  GOOGLE_API_KEY: z.string()
});

export const serverEnv = serverSchema.safeParse({
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  CLERK_JWT_KEY: process.env.CLERK_JWT_KEY,
  CLERK_ENCRYPTION_KEY: process.env.CLERK_ENCRYPTION_KEY,
  UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
  CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
  CONVEX_AUTH_SECRET: process.env.CONVEX_AUTH_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
});

export const clientEnv = clientSchema.safeParse({
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
});

if (!serverEnv.success) {
  console.warn(
    "[env] Server environment variables missing or invalid:",
    serverEnv.error.flatten().fieldErrors
  );
}

if (!clientEnv.success) {
  console.warn(
    "[env] Client environment variables missing or invalid:",
    clientEnv.error.flatten().fieldErrors
  );
}
