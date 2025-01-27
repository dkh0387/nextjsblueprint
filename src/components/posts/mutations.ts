import { PostsPage } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { DeletePost } from "@/components/posts/actions";

export function useDeletePostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathName = usePathname();

  const mutation = useMutation({
    mutationFn: DeletePost,
    // We retrieve here deleted post, which was returned from DeletePost
    onSuccess: async (deletedPost) => {
      // updating multiple feeds at once, since we want to delete the post in all feeds
      const queryFilter: QueryFilters = { queryKey: ["post-feed"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;
          return {
            pageParams: oldData?.pageParams,
            pages: oldData?.pages.map((page) => ({
              nextCursor: page.nextCursor,
              // all posts except the one to delete
              posts: page.posts.filter((post) => post.id !== deletedPost.id),
            })),
          };
        },
      );
      toast({
        description: "Post deleted",
      });

      // After deleting, we redirect to the user profile page
      if (pathName === `/posts/${deletedPost.id}`) {
        router.push(`/users/${deletedPost.user.username}`);
      }
    },
    onError: async (error) => {
      console.log(error);
      toast({
        variant: "destructive",
        description: "Failed to delete post. Please try again later.",
      });
    },
  });
  return mutation;
}
