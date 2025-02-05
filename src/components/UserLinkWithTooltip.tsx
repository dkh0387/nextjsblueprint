"use client";

import {PropsWithChildren} from "react";
import {useQuery} from "@tanstack/react-query";
import {UserData} from "@/lib/types";
import ky, {HTTPError} from "ky";
import Link from "next/link";
import UserTooltip from "@/components/UserTooltip";

/**
 * Client component for wrapping user data fetched by username within a [UserTooltip].
 * User data are being fetched and cached using ReactQuery.
 */
interface UserLinkWithTooltipProps extends PropsWithChildren {
  username: string;
}

export default function UserLinkWithTooltip(props: UserLinkWithTooltipProps) {
  const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';
  const kyInstance = ky.create({ prefixUrl: baseURL });
  const { data: userByName } = useQuery({
    queryKey: ["user-data", props.username],
    queryFn: () =>
      kyInstance.get(`api/users/username/${props.username}`).json<UserData>(),
    // retry up to 3 times only if there was no "user does not exist" error.
    retry(failureCount, error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: Infinity,
  });

  if (!userByName) {
    return (
      <Link
        href={`/users/${props.username}`}
        className="text-primary hover:underline"
      >
        {props.children}
      </Link>
    );
  }
  return (
    <UserTooltip user={userByName}>
      <Link
        href={`/users/${props.username}`}
        className="text-primary hover:underline"
      >
        {props.children}
      </Link>
    </UserTooltip>
  );
}
