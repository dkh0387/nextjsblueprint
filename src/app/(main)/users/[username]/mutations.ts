import {useToast} from "@/components/ui/use-toast";
import {useRouter} from "next/navigation";
import {InfiniteData, QueryFilters, useMutation, useQueryClient,} from "@tanstack/react-query";
import {useUploadThing} from "@/lib/uploadthing";
import {UpdateUserProfileValues} from "@/lib/validation";
import {updateUserProfile} from "@/app/(main)/users/[username]/actions";
import {PostsPage} from "@/lib/types";

/**
 * Update query cache after updating a user profile (optimistic update in place).
 */
export function useUpdateProfileMutation() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  // Exported upload hook from uploadthing
  const { startUpload: startAvatarUpload } = useUploadThing("avatar");

  return useMutation({
    mutationFn: async ({
      values,
      avatar,
    }: {
      values: UpdateUserProfileValues;
      avatar?: File;
    }) => {
      return Promise.all([
        // update displayname and bio
        updateUserProfile(values),
        // upload new avatar image
        avatar && startAvatarUpload([avatar]),
      ]);
    },
    // Update cache in place after uploading a new user avatar
    onSuccess: async ([updatedUser, uploadResult]) => {
      // uploadResult is the return from Promise above
      const newAvatarUrl = uploadResult?.[0].serverData.avatarUrl;

      const queryFilter: QueryFilters = {
        queryKey: ["post-feed"],
      };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;
          // take each post and update the user information
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                if (post.user.id === updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser,
                      avatarUrl: newAvatarUrl || updatedUser.avatarUrl,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        },
      );
      // Update server component with the latest data
      router.refresh();

      toast({ description: "Profile successfully updated" });
    },
    onError: async (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to update profile. Please try again.",
      });
    },
  });
}
