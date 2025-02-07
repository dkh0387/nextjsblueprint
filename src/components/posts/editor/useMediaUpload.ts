import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";

export interface Attachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

/**
 * Custom hook for uploading media files.
 * @constructor
 */
export default function useMediaUpload() {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>();
  // pointing to the accoridng endpoint in src/app/api/uploadthing/core.ts,
  // so returns of it can be used here.
  const { startUpload, isUploading } = useUploadThing("attachment", {
    // renaming a file for uniqueness
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop();
        return new File(
          [file],
          `attachment_${crypto.randomUUID()}.${extension}`,
          { type: file.type },
        );
      });
      setAttachments((prev) => [
        ...prev,
        ...renamedFiles.map((file) => ({ file, isUploading: true })),
      ]);
      return renamedFiles;
    },
    onUploadProgress: setUploadProgress,
    // after uploading, we replace media ids
    onClientUploadComplete(res) {
      setAttachments((prev) =>
        prev.map((a) => {
          const uploadResult = res.find((r) => r.name === a.file.name);

          if (!uploadResult) return a;
          return {
            ...a,
            mediaId: uploadResult.serverData.mediaId,
            isUploading: false,
          };
        }),
      );
    },
    // If the upload failed, we remove all the attachments which are uploading
    onUploadError: (err) => {
      setAttachments((prev) => prev.filter((a) => !a.isUploading));
      toast({ variant: "destructive", description: err.message });
    },
  });

  // Allow only one upload at a time
  function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast({
        variant: "destructive",
        description: "Please wait for the current upload to finish.",
      });
      return;
    }

    if (attachments.length + files.length > 5) {
      toast({
        variant: "destructive",
        description: "You can only upload up to 5 attachments per post.",
      });
      return;
    }
    startUpload(files);
  }

  function removeAttachment(fielName: string) {
    setAttachments((prev) => prev.filter((a) => a.file.name !== fielName));
  }

  function resetMediaUploads() {
    setAttachments([]);
    setUploadProgress(undefined);
  }

  return {
    startUpload: handleStartUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    resetMediaUploads,
  };
}
