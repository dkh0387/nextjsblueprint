import {createRouteHandler} from "uploadthing/next";
import {fileRouter} from "@/app/api/uploadthing/core";

/**
 * Endpoints for down/upload files over uploadthing.
 */
export const { GET, POST } = createRouteHandler({
  router: fileRouter,
});
