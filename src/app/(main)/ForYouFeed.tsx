"use client";

import {PostData, PostsPage} from "@/lib/types";
import {useInfiniteQuery} from "@tanstack/react-query";
import {Loader2} from "lucide-react";
import Post from "@/components/posts/Post";
import kyInstance from "@/lib/ky";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";

/**
 * Example of fetching data from an endpoint.
 * All data get a key and are cached through ReactQuery caching.
 * If the component is being opened again, we revalidate data using the key.
 * @constructor
 */
export default function ForYouFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "for-you"],
    /*The way to fetch data from endpoint without Ky*/
    /*    queryFn: async () => {
                                              const res = await fetch("api/posts/for-you");
                                    
                                              if (!res.ok) {
                                                throw Error(`Request failed with status code ${res.status}`);
                                              }
                                              return res.json();
                                                                              },*/
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "api/posts/for-you",
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
        There are no posts yet.
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
