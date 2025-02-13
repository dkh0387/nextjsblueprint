"use client";

import {NotificationData, NotificationsPage,} from "@/lib/types";
import {useInfiniteQuery, useMutation, useQueryClient,} from "@tanstack/react-query";
import {Loader2} from "lucide-react";
import kyInstance from "@/lib/ky";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import Notification from "@/app/(main)/notifications/Notification";
import {useEffect} from "react";

/**
 * Example of fetching data from an endpoint.
 * All data get a key and are cached through ReactQuery caching.
 * If the component is being opened again, we revalidate data using the key.
 * @constructor
 */
export default function Notifications() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "api/notifications",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<NotificationsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // optimistic update for unred notification display: set to zero in cache
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => kyInstance.patch("/api/notifications/mark-as-read"),
    onSuccess: async () => {
      queryClient.setQueryData(["unread-notification-count"], {
        unreadCount: 0,
      });
    },
    onError: async (error) => {
      console.error("Failed to mark notifications as read", error);
    },
  });

  // automatically call the mutation above and click the notification count button
  // as soon as the page is loaded, all notifications are marked as read
  useEffect(() => {
    mutation.mutate();
  }, []);

  const notifications: NotificationData[] =
    data?.pages.flatMap((notification) => notification.notifications) || [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !notifications.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        You don&apos;t have any notifications yet.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading notifications.
      </p>
    );
  }
  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {/*example of creating HTML content in loop*/}
      {notifications.map((notification) => (
        <Notification key={notification.id} notification={notification} />
      ))}
      {isFetching && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
