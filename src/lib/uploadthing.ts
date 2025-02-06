import {AppFileRouter} from "@/app/api/uploadthing/core";
import {generateReactHelpers} from "@uploadthing/react";

/**
 * Hook and function provided by uploadthing for uploading files.
 */
export const { useUploadThing, uploadFiles } =
    generateReactHelpers<AppFileRouter>();
