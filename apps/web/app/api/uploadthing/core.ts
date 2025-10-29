import { getAuth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { recordUploadInConvex } from "@/lib/uploadthing/convexAdapter";

const f = createUploadthing();

export const editorFileRouter = {
  "editor-assets": f({ image: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      if (!process.env.UPLOADTHING_TOKEN) {
        throw new UploadThingError("UploadThing token missing");
      }

      const clerkConfigured =
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
        process.env.CLERK_SECRET_KEY;

      try {
        if (!clerkConfigured) {
          return { userId: "dev-placeholder" };
        }

        const { userId } = getAuth(req);
        if (!userId) {
          throw new UploadThingError("Unauthorized");
        }

        return { userId };
      } catch (error) {
        throw new UploadThingError(
          error instanceof Error ? error.message : "Unauthorized"
        );
      }
    })
    .onUploadComplete(async (result) => {
      const { metadata, file } = result;

      await recordUploadInConvex({
        userId: metadata.userId,
        fileKey: file.key,
        fileName: file.name ?? file.key,
        fileUrl: file.url,
        fileType: file.type ?? null,
        fileSize: file.size ?? null,
        metadata: metadata ?? null
      });

      return {
        uploadedBy: metadata.userId,
        url: file.url
      };
    })
} satisfies FileRouter;

export type EditorFileRouter = typeof editorFileRouter;
