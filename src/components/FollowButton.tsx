"use client";

import {FollowerInfo} from "@/lib/types";
import useFollowerInfo from "@/hooks/useFollowerInfo";
import {useToast} from "@/components/ui/use-toast";
import {QueryKey, useMutation, useQueryClient} from "@tanstack/react-query";
import {Button} from "@/components/ui/button";
import ky from "ky";

/**
 * 1. useToast is a custom hook that is likely to display a toast message,
 *    for example, a hint when a user follows or stops following another user.
 * 2. useQueryClient is a React Query library hook that provides a QueryClient used for retrieving,
 *    caching and updating asynchronous data in React application
 * 3. useFollowerInfo is a custom hook that is likely to retrieve information
 *    about whether the logged-in user is following the user identified by props.userId.
 *    It uses the initial state provided by props.initialState
 * 4. useMutation is another React Query hook used for mutations,
 *    which are operations that change data on the server side.
 */
interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
}

/**
 * The full example of optimistic update functionality.
 * Context: follow/unfollow a user and update cached follower info in place.
 * @param props
 * @constructor
 */
export default function FollowButton(props: FollowButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data } = useFollowerInfo(props.userId, props.initialState);
  const queryKey: QueryKey = ["follower-info", props.userId];
  const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';
  const kyInstance = ky.create({ prefixUrl: baseURL });
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByLoggedInUser
        ? kyInstance.delete(`api/users/${props.userId}/followers`)
        : kyInstance.post(`api/users/${props.userId}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      // in case the update did not work and for update base
      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);
      // optimistic update the previousState
      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (previousState?.followers || 0) +
          (previousState?.isFollowedByLoggedInUser ? -1 : 1),
        isFollowedByLoggedInUser: !previousState?.isFollowedByLoggedInUser,
      }));
      return { previousState };
    },
    // rollback and go to the previousState
    onError: (error, variables, context) => {
      queryClient.setQueryData<FollowerInfo>(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: error.message,
      });
    },
  });
  return (
    /*Depending on whether we are already following the user or not*/
    <Button
      variant={data.isFollowedByLoggedInUser ? "secondary" : "default"}
      onClick={() => mutate()}
    >
      {data.isFollowedByLoggedInUser ? "Unfollow" : "Follow"}
    </Button>
  );
}
