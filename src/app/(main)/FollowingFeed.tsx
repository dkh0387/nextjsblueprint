"use client";

import {PostData, PostsPage} from "@/lib/types";
import {useInfiniteQuery} from "@tanstack/react-query";
import {Loader2} from "lucide-react";
import Post from "@/components/posts/Post";
import kyInstance from "@/lib/ky";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";

/**
 * Endpoint for fetching the following feed from users whom the logged-in user is following.
 * @constructor
 */
export default function FollowingFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "following"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "api/posts/following",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts: PostData[] = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  // if you do not have any posts yet
  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        No Posts found.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    );
  }
  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {/*example of creating HTML content in loop*/}
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetching && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
