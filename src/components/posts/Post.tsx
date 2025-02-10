"use client";

import {PostData} from "@/lib/types";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import {cn, formatRelativeDate} from "@/lib/utils";
import {useSession} from "@/app/(main)/SessionProvider";
import PostMoreButton from "@/components/posts/PostMoreButton";
import Linkify from "@/components/Linkify";
import UserTooltip from "@/components/UserTooltip";
import {Media} from "@prisma/client";
import Image from "next/image";
import LikeButton from "@/components/posts/LikeButton";

/**
 * Single post canvas.
 */
interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  // NOTE: since it is a client component, we cannot use validateRequest() here.
  const { user: loggedInUser } = useSession();

  return (
    /*group: we group here to hover over the whole div for showing the PostMoreButton
     * NOTE: if we have multiple groups (like posts and their comments) groups need names to separate them
     * */
    <article className="group/post space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={post.user}>
              <Link
                href={`/users/${post.user.username}`}
                className="block font-medium hover:underline"
              >
                {post.user.displayName}
              </Link>
            </UserTooltip>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
              suppressHydrationWarning
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        {post.user.id === loggedInUser.id && (
          <PostMoreButton
            post={post}
            /*Usage of group from the article above
             * opacity-0: the button is transparent as default
             * transition-opacity: the change is animated
             * */
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          ></PostMoreButton>
        )}
      </div>
      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkify>
      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} />
      )}
      <LikeButton
        isHidden={post.user.id === loggedInUser.id}
        postId={post.id}
        initialState={{
          likes: post._count.likes,
          isLikedByLoggedInUser: post.likes.some(
            (l) => l.userId === loggedInUser.id,
          ),
        }}
      />
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews(props: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        props.attachments.length > 1 && "sm:grid-cols-2",
      )}
    >
      {props.attachments.map((m) => (
        <MediaPreview key={m.id} media={m} />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
}

function MediaPreview(props: MediaPreviewProps) {
  if (props.media.type === "IMAGE") {
    return (
      <Image
        src={props.media.url}
        alt="Attachment"
        width={500}
        height={500}
        className="mx-auto size-fit max-h-[30rem] rounded-2xl"
      />
    );
  }
  if (props.media.type === "VIDEO") {
    return (
      <div>
        <video
          src={props.media.url}
          controls
          className="mx-auto size-fit max-h-[30rem] rounded-2xl"
        ></video>
      </div>
    );
  }
  return <p className="text-destructive">Unsupported media type</p>;
}
