import { createRouteHandler } from "uploadthing/next";

import { editorFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: editorFileRouter
});
