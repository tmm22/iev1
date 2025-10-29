import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { serverEnv } from "@/lib/env";

const f = createUploadthing();

export const editorFileRouter = {
  "editor-assets": f({ image: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async () => {
      if (!serverEnv.success) {
        throw new UploadThingError("UploadThing environment variables missing");
      }

      try {
        const { userId } = auth();
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
      return {
        uploadedBy: metadata.userId,
        url: file.url
      };
    })
} satisfies FileRouter;

export type EditorFileRouter = typeof editorFileRouter;
