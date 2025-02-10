"use client";

import {LikeInfo} from "@/lib/types";
import {useToast} from "@/components/ui/use-toast";
import {QueryKey, useMutation, useQuery, useQueryClient,} from "@tanstack/react-query";
import ky from "ky";
import {Heart} from "lucide-react";
import {cn} from "@/lib/utils";

/**
 * 1. useToast is a custom hook that is likely to display a toast message,
 *    for example, a hint when a user likes or unlike a post.
 * 2. useQueryClient is a React Query library hook that provides a QueryClient used for retrieving,
 *    caching and updating asynchronous data in React application
 * 3. useLikeInfo is a custom hook that is likely to retrieve information
 *    about whether the logged-in user likes the post identified by props.postId.
 *    It uses the initial state provided by props.initialState
 * 4. useMutation is another React Query hook used for mutations,
 *    which are operations that change data on the server side.
 */
interface LikeButtonProps {
  postId: string;
  initialState: LikeInfo;
  isHidden: boolean;
}

/**
 * The full example of optimistic update functionality.
 * Context: like/unlike a post and update cached like info in place.
 * @param props
 * @constructor
 */
export default function LikeButton(props: LikeButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["like-info", props.postId];
  const baseURL = process.env.REACT_APP_BASE_URL || "http://localhost:3000";
  const kyInstance = ky.create({ prefixUrl: baseURL });

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`api/posts/${props.postId}/likes`).json<LikeInfo>(),
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data?.isLikedByLoggedInUser
        ? kyInstance.delete(`api/posts/${props.postId}/likes`)
        : kyInstance.post(`api/posts/${props.postId}/likes`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      // in case the update did not work and for update base
      const previousState = queryClient.getQueryData<LikeInfo>(queryKey);
      // optimistic update the previousState
      queryClient.setQueryData<LikeInfo>(queryKey, () => ({
        likes:
          (previousState?.likes || 0) +
          (previousState?.isLikedByLoggedInUser ? -1 : 1),
        isLikedByLoggedInUser: !previousState?.isLikedByLoggedInUser,
      }));
      return { previousState };
    },
    // rollback and go to the previousState
    onError: (error, variables, context) => {
      queryClient.setQueryData<LikeInfo>(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: error.message,
      });
    },
  });
  return (
    /*Depending on whether we are already liked the post or not*/
      <div hidden={props.isHidden}>
        <hr className="text-muted-foreground"/>
        <button
            className="flex w-full items-center justify-center gap-2 p-2"
            onClick={() => mutate()}
        >
          <Heart
              className={cn(
                  "size-5",
                  data?.isLikedByLoggedInUser && "fill-red-500 text-red-500",
              )}
          />
          {/*tabular-nums: every number has the same width*/}
          <span className="text-sm font-medium tabular-nums">
          {data?.likes} <span className="hidden sm:inline">likes</span>
        </span>
        </button>
      </div>
  );
}
