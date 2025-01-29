"use client";

import { FollowerInfo } from "@/lib/types";
import useFollowerInfo from "@/hooks/useFollowerInfo";
import { formatNumber } from "@/lib/utils";

interface FollowerCountProps {
  userId: string;
  initialState: FollowerInfo;
}

/**
 * Calling the hook for fetching user follower info to use optimistic update of follower count.
 * @param props
 * @constructor
 */
export default function FollowerCount(props: FollowerCountProps) {
  const { data } = useFollowerInfo(props.userId, props.initialState);
  return (
    <span>
      Followers:{" "}
      <span className="font-semibold">{formatNumber(data.followers)}</span>
    </span>
  );
}
