"use client";

import React, {PropsWithChildren} from "react";
import {FollowerInfo, UserData} from "@/lib/types";
import {useSession} from "@/app/(main)/SessionProvider";

import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip";
import FollowButton from "@/components/FollowButton";
import Linkify from "@/components/Linkify";
import FollowerCount from "@/components/FollowerCount";

/**
 * User tooltip.
 */
interface UserTooltipProps extends PropsWithChildren {
  user: UserData;
}

export default function UserTooltip(props: UserTooltipProps) {
  const { user: loggedInUser } = useSession();
  const followerState: FollowerInfo = {
    followers: props.user._count.followers,
    isFollowedByLoggedInUser: props.user.followers.some(
      (follower) => follower.followerId === loggedInUser.id,
    ),
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{props.children}</TooltipTrigger>
        <TooltipContent>
          <div className="fley-col flex max-w-80 gap-3 break-words px-1 py-2.5 md:min-w-52">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/users/${props.user.username}`}>
                <UserAvatar size={70} avatarUrl={props.user.avatarUrl} />
              </Link>
              {loggedInUser.id != props.user.id && (
                <FollowButton
                  userId={props.user.id}
                  initialState={followerState}
                />
              )}
            </div>
            <div>
              <Link href={`/users/${props.user.username}`}>
                <div className="hover: text-lg font-semibold underline">
                  {props.user.displayName}
                </div>
                <div className="text-muted-foreground">
                  @{props.user.username}
                </div>
              </Link>
            </div>
            {props.user.bio && (
              <Linkify>
                {/*line-clamp-4: if it is bigger than 4 lines dots appear*/}
                <div className="line-clamp-4 whitespace-pre-line">
                  {props.user.bio}
                </div>
              </Linkify>
            )}
            <FollowerCount
              userId={props.user.id}
              initialState={followerState}
            ></FollowerCount>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
