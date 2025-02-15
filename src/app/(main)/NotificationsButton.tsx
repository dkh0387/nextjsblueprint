"use client";

import {NotificationCountInfo} from "@/lib/types";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Bell} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import kyInstance from "@/lib/ky";

/**
 * Button with unread count display for notifications.
 */
interface NotificationsButtonProps {
  initialState: NotificationCountInfo;
}

export default function NotificationsButton(props: NotificationsButtonProps) {
  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: () =>
      kyInstance
        .get("/api/notifications/unread-count")
        .json<NotificationCountInfo>(),
    initialData: props.initialState,
    // refetch data every minute
    refetchInterval: 60 * 1000,
  });
  return (
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-3"
      title="Notifications"
      asChild
    >
      <Link href="/notifications">
        <div className="relative">
          <Bell />
          {/*-right-1: position further in the right as normal*/}
          {!!data.unreadCount && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-xs font-medium tabular-nums text-primary-foreground">
              {data.unreadCount}
            </span>
          )}
        </div>
        <span className="hidden lg:inline">Notifications</span>
      </Link>
    </Button>
  );
}
