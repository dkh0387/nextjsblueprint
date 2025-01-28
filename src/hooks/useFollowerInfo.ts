import {FollowerInfo} from "@/lib/types";
import {useQuery} from "@tanstack/react-query";
import kyInstance from "@/lib/ky";

/**
 * Gets follower information for a user.
 */
export default function useFollowerInfo(
  userId: string,
  initialState: FollowerInfo,
) {
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () =>
      kyInstance.get(`api/users/${userId}/followers`).json<FollowerInfo>(),
    initialData: initialState,
    // cache time, means the cache is not being revalidate automatically, but only per our request
    staleTime: Infinity,
  });
  return query;
}
