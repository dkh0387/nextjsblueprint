import {useToast} from "@/components/ui/use-toast";
import {CommentsPage} from "@/lib/types";
import {InfiniteData, QueryKey, useMutation, useQueryClient,} from "@tanstack/react-query";
import {deleteComment, submitComment} from "./actions";

/**
 * ReactQuery posts mutation on submitting.
 * We want the page to reload automatically after a new comment was submitted.
 * The idea is not to destroy and reload the whole cache, but to add the submitted comment to the existing cache on bottom.
 * Toast allows showing a message in the bottom right corner (like notifications).
 */
export function useSubmitCommentMutation(postId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitComment,
    onSuccess: async (newComment) => {
      const queryKey: QueryKey = ["comments", postId];

      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        queryKey,
        // take the first page and put the submitted comment as last into it
        (oldData) => {
          // load the first page
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            const newCommentsPage = {
              // place the new comment as last
              comments: [...firstPage.comments, newComment],
              previousCursor: firstPage.previousCursor,
            };
            return {
              pageParams: oldData.pageParams,
              pages: [
                newCommentsPage,
                // remove the first page since it is added above
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );
      /**
       * invalidate all queries where data is null.
       * In case a new comment is submitted before the first page is loaded (very rare).
       */
      await queryClient.invalidateQueries({
        queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });

      await queryClient.invalidateQueries({
        queryKey: ["post-feed", "for-you"],
      });

      toast({
        description: "Comment created",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: error.message,
      });
    },
  });
  return mutation;
}

export function useDeleteCommentMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async (deletedComment) => {
      const queryKey: QueryKey = ["comments", deletedComment.postId];

      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              previousCursor: page.previousCursor,
              comments: page.comments.filter((c) => c.id !== deletedComment.id),
            })),
          };
        },
      );

      await queryClient.invalidateQueries({
        queryKey: ["post-feed", "for-you"],
      });

      toast({
        description: "Comment deleted",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to delete comment. Please try again.",
      });
    },
  });
  return mutation;
}
