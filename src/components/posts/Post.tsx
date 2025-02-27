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
import BookmarkButton from "@/components/posts/BookmarkButton";
import {useState} from "react";
import {MessageSquare} from "lucide-react";
import Comments from "@/components/comments/Comments";

/**
 * Single post canvas.
 */
interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  // NOTE: since it is a client component, we cannot use validateRequest() here.
  const { user: loggedInUser } = useSession();
  // We have a button to show/hide comments, so we need to track the state of it.
  const [showComments, setShowComments] = useState(false);

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
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByLoggedInUser: post.likes.some(
                (l) => l.userId === loggedInUser.id,
              ),
            }}
          />
          <CommentButton
            post={post}
            onClick={() => setShowComments(!showComments)}
          ></CommentButton>
        </div>
        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByLoggedInUser: post.bookmarks.some(
              (b) => b.userId === loggedInUser.id,
            ),
          }}
        />
      </div>
      {showComments && <Comments post={post} />}
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

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentButton(props: CommentButtonProps) {
  return (
    <button onClick={props.onClick} className="flex items-center gap-2">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {props.post._count.comments}{" "}
        <span className="hide sm:inline"> comments</span>
      </span>
    </button>
  );
}
