"use client";

import {useSession} from "@/app/(main)/SessionProvider";
import {Button} from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import Placeholder from "@tiptap/extension-placeholder";
import {EditorContent, useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "./styles.css";
import {useSubmitPostMutation} from "@/components/posts/editor/mutations";
import useMediaUpload, {Attachment,} from "@/components/posts/editor/useMediaUpload";
import {ClipboardEvent, useRef} from "react";
import {ImageIcon, Loader2, X} from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import {cn} from "@/lib/utils";
import Image from "next/image";
import {useDropzone} from "@uploadthing/react";

/**
 * Component for creating a new post.
 * @constructor
 */
export default function PostEditor() {
  const { user } = useSession();
  const mutation = useSubmitPostMutation();
  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    resetMediaUploads,
  } = useMediaUpload();

  // Drag&Drop support from uploadthing
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  });

  const { onClick, ...rootProps } = getRootProps();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "What's crack-a-lackin'?",
      }),
    ],
  });

  const input =
      editor?.getText({
        blockSeparator: "\n",
      }) || "";

  function onSubmit() {
    mutation.mutate(
        {
          content: input,
          // filter(Boolean): only defined entries
          mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
        },
        {
          onSuccess: () => {
            editor?.commands.clearContent();
            resetMediaUploads();
          },
        },
    );
  }

  /*
          Copy&Paste attachments.
           */
  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
        .filter((i) => i.kind === "file")
        .map((i) => i.getAsFile()) as File[];
    startUpload(files);
  }

  return (
      <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
        <div className="flex gap-5">
          <UserAvatar
              avatarUrl={user.avatarUrl}
              className="hidden size-12 sm:inline"
          />
          <div {...rootProps} className="w-full">
            <EditorContent
                editor={editor}
                className={cn(
                    "max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3",
                    isUploading && "outline-dashed",
                )}
                onPaste={onPaste}
            />
            <input {...getInputProps()} />
          </div>
        </div>
        {!!attachments.length && (
            <AttachmentPreviews
                attachments={attachments}
                removeAttachment={removeAttachment}
            ></AttachmentPreviews>
        )}
        {/*justify-end: button placed at the end*/}
        <div className="flex items-center justify-end gap-3">
          {/*upload progress*/}
          {isUploading && (
              <>
                <span className="text-sm">{uploadProgress ?? 0}%</span>
                <Loader2 className="size-5 animate-spin text-primary"></Loader2>
              </>
          )}
          <AddAttachmentsButton
              onFilesSelected={startUpload}
              disabled={isUploading || attachments.length >= 5}
          ></AddAttachmentsButton>
          <LoadingButton
              onClick={onSubmit}
              disabled={!input.trim() || isUploading}
              className="min-w-20"
              loading={mutation.isPending}
          >
            Post
          </LoadingButton>
        </div>
      </div>
  );
}

interface AddAttachmentsButtonProps {
  // trigger for upload
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddAttachmentsButton(props: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
      <>
        <Button
            variant="ghost"
            size="icon"
            className="text-primary hover:text-primary"
            disabled={props.disabled}
            onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon size={20}></ImageIcon>
        </Button>
        <input
            type="file"
            accept="image/*, video/*"
            multiple
            ref={fileInputRef}
            className="sr-only hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);

              if (files.length) {
                props.onFilesSelected(files);
                e.target.value = "";
              }
            }}
        ></input>
      </>
  );
}

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentPreviews(props: AttachmentPreviewsProps) {
  return (
      <div
          className={cn(
              "flex flex-col gap-3",
              props.attachments.length > 1 && "sm:grid sm:grid-cols-2",
          )}
      >
        {props.attachments.map((attachment) => (
            <AttachmentPreview
                key={attachment.file.name}
                attachment={attachment}
                onRemoveClick={() => props.removeAttachment(attachment.file.name)}
            />
        ))}
      </div>
  );
}

interface AttachmentsPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

function AttachmentPreview(props: AttachmentsPreviewProps) {
  const src = URL.createObjectURL(props.attachment.file);
  return (
      <div
          className={cn(
              "relative mx-auto size-fit",
              props.attachment.isUploading && "opacity-50",
          )}
      >
        {props.attachment.file.type.startsWith("image") ? (
            <Image
                src={src}
                alt="Attachment preview"
                width={500}
                height={500}
                className="size-fit max-h-[30rem] rounded-2xl"
            />
        ) : (
            /* controls: play/pause buttons for video
             * we have to place a source within the video tag,
             * because otherwise the video is reloaded every time the component is rendered.
             * */
            <video controls className="size-fit max-h-[30rem] rounded-2xl">
              <source src={src} type={props.attachment.file.type} />
            </video>
        )}
        {/*we cannot cancel a running upload, so the delete button only if not loading*/}
        {!props.attachment.isUploading && (
            <button
                onClick={props.onRemoveClick}
                className="top-3, absolute right-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
            >
              <X size={20} />
            </button>
        )}
      </div>
  );
}
