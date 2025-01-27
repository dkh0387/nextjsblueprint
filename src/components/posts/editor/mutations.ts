import {useToast} from "@/components/ui/use-toast";
import {PostsPage} from "@/lib/types";
import {InfiniteData, QueryFilters, useMutation, useQueryClient,} from "@tanstack/react-query";
import {submitPost} from "./actions";

/**
 * ReactQuery posts mutation on submitting.
 * We want the page to reload automatically after a new post was submitted.
 * The idea is not to destroy and reload the whole cache, but to add the submitted post to the existing cache on top.
 * Toast allows showing a message in the bottom right corner (like notifications).
 */
export function useSubmitPostMutation() {
  let promise = new Promise(function (resolve, reject) {
    // eine Funktion, die dauert, bis Sie fertig ist
    setTimeout(function () {
      resolve("Versprochenes Ergebnis");
    }, 2000);
  });

  const { toast } = useToast();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      // filter cached data, which we want to change, by the key
      const queryFilter: QueryFilters = { queryKey: ["post-feed", "for-you"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        // take the first page and put the submitted post as first into it
        (oldData) => {
          // load the first page
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            const newPostsPage = {
              // place the new post as first
              posts: [newPost, ...firstPage.posts],
              nextCursor: firstPage.nextCursor,
            };
            return {
              pageParams: oldData.pageParams,
              pages: [
                newPostsPage,
                // remove the first page since it is added above
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      /**
       * invalidate all queries where data is null.
       * In case a new post is submitted before the first page is loaded (very rare).
       */
      await queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });

      toast({
        description: "Post created",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to post. Please try again.",
      });
    },
  });

  return mutation;
}
