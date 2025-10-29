import { generateReactHelpers } from "@uploadthing/react";
import type {
  ClientUploadedFileData,
  inferEndpointOutput
} from "uploadthing/types";

import type { EditorAsset } from "@/lib/state/editorStore";
import type { EditorFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<EditorFileRouter>();

type EditorUploadOutput = inferEndpointOutput<
  EditorFileRouter["editor-assets"]
>;

export type EditorUploadResult = ClientUploadedFileData<EditorUploadOutput>;

export function uploadResultToAsset(
  file: EditorUploadResult
): EditorAsset {
  return {
    id: file.key,
    name: file.name ?? file.key,
    url: file.url,
    source: "upload"
  };
}
