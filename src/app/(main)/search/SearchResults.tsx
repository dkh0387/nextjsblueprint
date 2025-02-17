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
interface SearchResultsProps {
  query: string;
}

export default function SearchResults(props: SearchResultsProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "search", props.query],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/search", {
          searchParams: {
            q: props.query,
            ...(pageParam ? { cursor: pageParam } : {}),
          },
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // time until the data will be garbage collected
    gcTime: 0,
  });

  const posts: PostData[] = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        No posts found for this query.
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
