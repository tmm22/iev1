import { ConvexHttpClient } from "convex/browser";

type UploadRecord = {
  userId: string;
  fileKey: string;
  fileName: string;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
  metadata?: Record<string, unknown> | null;
};

let convexClient: ConvexHttpClient | null = null;

let loggedMissingConvexUrl = false;

function getConvexUrl() {
  const url =
    process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL ?? null;

  if (!url && !loggedMissingConvexUrl) {
    console.warn(
      "[uploadthing] Convex URL missing; skipping upload metadata persistence. " +
        "Set `NEXT_PUBLIC_CONVEX_URL` (recommended) or `CONVEX_URL` to your Convex deployment URL, " +
        "e.g. https://your-project.convex.cloud. " +
        `(current NEXT_PUBLIC_CONVEX_URL=${process.env.NEXT_PUBLIC_CONVEX_URL ?? "undefined"}, ` +
        `CONVEX_URL=${process.env.CONVEX_URL ?? "undefined"})`
    );
    loggedMissingConvexUrl = true;
  }

  return url;
}

async function getClient() {
  const url = getConvexUrl();
  if (!url) {
    return null;
  }

  if (!convexClient) {
    convexClient = new ConvexHttpClient(url);
  }

  return convexClient;
}

export async function getConvexClient() {
  return getClient();
}

export async function recordUploadInConvex(record: UploadRecord) {
  const client = await getClient();
  if (!client) {
    return;
  }

  try {
    await client.mutation(
      "internal/uploads:recordUpload" as any,
      {
        userId: record.userId,
        fileKey: record.fileKey,
        fileName: record.fileName,
        fileUrl: record.fileUrl,
        fileType: record.fileType ?? undefined,
        fileSize: record.fileSize ?? undefined,
        metadata: record.metadata ?? undefined
      }
    );
  } catch (error) {
    console.error(
      "[uploadthing] Failed to persist upload metadata to Convex",
      error
    );
  }
}
