import React, {cache} from "react";
import {prisma} from "@/lib/prisma";
import {FollowerInfo, getFollowingUserDataSelect, UserData} from "@/lib/types";
import {notFound} from "next/navigation";
import {validateRequest} from "@/auth";
import TrendsSideBar from "@/components/TrendsSideBar";
import UserAvatar from "@/components/UserAvatar";
import {formatDate} from "date-fns";
import {formatNumber} from "@/lib/utils";
import FollowerCount from "@/components/FollowerCount";
import FollowButton from "@/components/FollowButton";
import {Button} from "@/components/ui/button";
import UserPosts from "@/app/(main)/users/[username]/UserPosts";
import Linkify from "@/components/Linkify";

/**
 * User page server component.
 */
interface PageProps {
  params: {
    username: string;
  };
}

/**
 * We have to fetch the user twice, once for the metadata nad for the component itself.
 * SELECT id, username, displayname, avatarUrl, f.followerId
 * FROM users u INNER JOIN followers f ON u.userId = f.followerId
 * WHERE username =: IGNORE_CASE(username);
 */
const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: { equals: username, mode: "insensitive" },
    },
    select: getFollowingUserDataSelect(loggedInUserId),
  });

  if (!user) notFound();
  return user;
});

/**
 * Dynamic page title depending on user.
 */
export async function generateMetadata(props: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return {};
  const user = await getUser(props.params.username, loggedInUser.id);
  return {
    title: `${user.displayName} (@${user.username})`,
  };
}

export default async function Page(props: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }
  const user = await getUser(props.params.username, loggedInUser.id);
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUserId={loggedInUser.id} />
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName}&apos;s posts
          </h2>
        </div>
        <UserPosts userId={user.id} />
      </div>
      <TrendsSideBar />
    </main>
  );
}

interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}

async function UserProfile(props: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: props.user._count.followers,
    isFollowedByLoggedInUser: props.user.followers.some(
      ({ followerId }) => followerId === props.loggedInUserId,
    ),
  };
  return (
    <div className="h-fit w-full space-y-5 bg-card p-5 shadow-sm">
      <UserAvatar
        avatarUrl={props.user.avatarUrl}
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      {/*User information*/}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          {/*User display name*/}
          <div>
            <h1 className="text-3xl font-bold">{props.user.displayName}</h1>
            <div className="text-muted-foreground">@{props.user.username}</div>
          </div>
          <div>
            Member since {formatDate(props.user.createdAt, "MMM d, yyyy")}
          </div>
          {/*Number of posts and followers of the user*/}
          <div className="flex items-center gap-3">
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formatNumber(props.user._count.posts)}
              </span>
            </span>
            {/*The Number of followers should update in place, so we have to use useFollowInfo() hook,
               but we can't directly, because suer profile page is a server component,
               and we only can call hooks with a client component*/}
            <FollowerCount userId={props.user.id} initialState={followerInfo} />
          </div>
        </div>
        {props.user.id === props.loggedInUserId ? (
          <Button>Edit Profile</Button>
        ) : (
          <FollowButton userId={props.user.id} initialState={followerInfo} />
        )}
      </div>
      {props.user.bio && (
        <>
          <hr />
          <Linkify>
            <div className="overflow-hidden whitespace-pre-line break-words">
              {props.user.bio}
            </div>
          </Linkify>
        </>
      )}
    </div>
  );
}
