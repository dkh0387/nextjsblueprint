import {generateReactHelpers} from "@uploadthing/react";
import {AppFileRouter} from "@/app/api/uploadthing/core";

/**
 * Hook and function provided by uploadthing for uploading files.
 */
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<AppFileRouter>();
