import {useToast} from "@/components/ui/use-toast";
import {CommentsPage} from "@/lib/types";
import {InfiniteData, QueryKey, useMutation, useQueryClient,} from "@tanstack/react-query";
import {submitComment} from "./actions";
import {useSession} from "@/app/(main)/SessionProvider";

/**
 * ReactQuery posts mutation on submitting.
 * We want the page to reload automatically after a new comment was submitted.
 * The idea is not to destroy and reload the whole cache, but to add the submitted comment to the existing cache on bottom.
 * Toast allows showing a message in the bottom right corner (like notifications).
 */
export function useSubmitCommentMutation(postId: string) {
  /*  let promise = new Promise(function (resolve, reject) {
                  setTimeout(function () {
                    resolve("Versprochenes Ergebnis");
                  }, 2000);
                });*/

  const { toast } = useToast();

  const queryClient = useQueryClient();

  const { user } = useSession();

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

      toast({
        description: "Comment created",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to comment. Please try again.",
      });
    },
  });

  return mutation;
}
