"use client";

import {BookmarkInfo} from "@/lib/types";
import {useToast} from "@/components/ui/use-toast";
import {QueryKey, useMutation, useQuery, useQueryClient,} from "@tanstack/react-query";
import ky from "ky";
import {Bookmark} from "lucide-react";
import {cn} from "@/lib/utils";

/**
 * 1. useToast is a custom hook that is likely to display a toast message,
 *    for example, a hint when a user bookmarks a post.
 * 2. useQueryClient is a React Query library hook that provides a QueryClient used for retrieving,
 *    caching and updating asynchronous data in React application
 * 3. bookmarkInfo is a custom hook that is likely to retrieve information
 *    about whether the logged-in user bookmarked the post identified by props.userId_postId.
 *    It uses the initial state provided by props.initialState
 * 4. useMutation is another React Query hook used for mutations,
 *    which are operations that change data on the server side.
 */
interface BookmarkButtonProps {
  postId: string;
  initialState: BookmarkInfo;
}

export default function BookmarkButton(props: BookmarkButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["bookmark-info", props.postId];
  const baseURL = process.env.REACT_APP_BASE_URL || "http://localhost:3000";
  const kyInstance = ky.create({ prefixUrl: baseURL });

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance
        .get(`api/posts/${props.postId}/bookmarks`)
        .json<BookmarkInfo>(),
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data?.isBookmarkedByLoggedInUser
        ? kyInstance.delete(`api/posts/${props.postId}/bookmarks`)
        : kyInstance.post(`api/posts/${props.postId}/bookmarks`),
    onMutate: async () => {
      toast({
        description: `Post ${data?.isBookmarkedByLoggedInUser ? "un" : ""}bookmarked`,
      })
      await queryClient.cancelQueries({ queryKey });
      // in case the update did not work and for update base
      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey);
      // optimistic update the previousState
      queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
        isBookmarkedByLoggedInUser: !previousState?.isBookmarkedByLoggedInUser,
      }));
      return { previousState };
    },
    // rollback and go to the previousState
    onError: (error, variables, context) => {
      queryClient.setQueryData<BookmarkInfo>(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: error.message,
      });
    },
  });
  return (
    /*Depending on whether we are already liked the post or not*/
    <button
      className="flex w-full items-center justify-center gap-2 p-2"
      onClick={() => mutate()}
    >
      <Bookmark
        className={cn(
          "size-5",
          data?.isBookmarkedByLoggedInUser && "fill-primary text-primary",
        )}
      />
    </button>
  );
}
