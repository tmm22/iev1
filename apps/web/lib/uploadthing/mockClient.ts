import { nanoid } from "nanoid/non-secure";
import type { EditorAsset } from "../state/editorStore";

export type UploadRequest = {
  file: File;
  slug: string;
};

export type UploadResponse = {
  fileKey: string;
  url: string;
  metadata: Record<string, unknown>;
};

export async function mockUpload(
  request: UploadRequest
): Promise<UploadResponse> {
  const id = nanoid(10);
  return {
    fileKey: `mock_${request.slug}_${id}`,
    url: `https://example.com/mock-assets/${id}?filename=${encodeURIComponent(
      request.file.name
    )}`,
    metadata: {
      size: request.file.size,
      type: request.file.type
    }
  };
}

export function uploadResponseToAsset(
  response: UploadResponse,
  fileName: string
): EditorAsset {
  return {
    id: response.fileKey,
    name: fileName,
    url: response.url,
    source: "upload"
  };
}
