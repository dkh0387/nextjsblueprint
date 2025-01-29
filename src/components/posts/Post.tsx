"use client";

import {PostData} from "@/lib/types";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import {formatRelativeDate} from "@/lib/utils";
import {useSession} from "@/app/(main)/SessionProvider";
import PostMoreButton from "@/components/posts/PostMoreButton";

/**
 * Single post canvas.
 */
interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  // NOTE: since it is a client component, we cannot use validateRequest() here.
  const { user } = useSession();

  return (
    /*group: we group here to hover over the whole div for showing the PostMoreButton
     * NOTE: if we have multiple groups (like posts and their comments) groups need names to separate them
     * */
    <article className="group/post space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Link href={`/user/${post.user.username}`}>
            <UserAvatar avatarUrl={post.user.avatarUrl} />
          </Link>
          <div>
            <Link
              href={`/users/${post.user.username}`}
              className="block font-medium hover:underline"
            >
              {post.user.displayName}
            </Link>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        {post.user.id === user.id && (
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
      <div className="whitespace-pre-line break-words">{post.content}</div>
    </article>
  );
}
