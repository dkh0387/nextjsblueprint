import React, {cache, Suspense} from "react";
import {prisma} from "@/lib/prisma";
import {getPostDataInclude, UserData} from "@/lib/types";
import {notFound} from "next/navigation";
import {validateRequest} from "@/auth";
import Post from "@/components/posts/Post";
import UserTooltip from "@/components/UserTooltip";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import {Loader2} from "lucide-react";
import Linkify from "@/components/Linkify";
import FollowButton from "@/components/FollowButton";

/**
 * Post details page.
 */
interface PageProps {
  params: { postId: string };
}

/**
 * Since we are going to call it twice here, we need to cache it.
 */
const getPost = cache(async (postId: string, loggedInUserId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: getPostDataInclude(loggedInUserId),
  });

  if (!post) notFound();
  return post;
});

/**
 * This function has to have exactly this name (React specific).
 * @param props
 */
export async function generateMetadata(props: PageProps) {
  const { user } = await validateRequest();

  if (!user) return {};
  const post = await getPost(props.params.postId, user.id);
  return {
    title: `${post.user.displayName}: ${post.content.slice(0, 50)}...`,
  };
}

export default async function Page(props: PageProps) {
  const { user } = await validateRequest();

  if (!user) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }
  const post = await getPost(props.params.postId, user.id);
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <Post post={post} />
      </div>
      <div className="sticky top-[5.25rem] hidden h-fit w-80 flex-none lg:block">
        <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
          <UserInfoSidebar user={post.user}></UserInfoSidebar>
        </Suspense>
      </div>
    </main>
  );
}

/**
 * User sidebar component.
 */
interface UserInfoSidebarProps {
  user: UserData;
}

async function UserInfoSidebar(props: UserInfoSidebarProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return null;
  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">About this user</div>
      <UserTooltip user={props.user}>
        <Link
          href={`/users/${props.user.username}`}
          className="flex items-center gap-3"
        >
          <UserAvatar avatarUrl={props.user.avatarUrl} className="flex-none" />
          <div>
            <p className="line-clamp-1 break-all font-semibold hover:underline">
              {props.user.displayName}
            </p>
            <p className="line-clamp-1 break-all text-muted-foreground">
              {props.user.username}
            </p>
          </div>
        </Link>
      </UserTooltip>
      <Linkify>
        <div className="line-clamp-6 whitespace-pre-line break-words text-muted-foreground">
          {props.user.bio}
        </div>
      </Linkify>
      {props.user.id !== loggedInUser.id && (
        <FollowButton
          userId={props.user.id}
          initialState={{
            followers: props.user._count.followers,
            isFollowedByLoggedInUser: props.user.followers.some(
              (follower) => follower.followerId === loggedInUser.id,
            ),
          }}
        ></FollowButton>
      )}
    </div>
  );
}
