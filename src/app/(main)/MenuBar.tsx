import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bookmark, Home } from "lucide-react";
import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import NotificationsButton from "@/app/(main)/NotificationsButton";
import MessagesButton from "@/app/(main)/messages/MessagesButton";
import streamServerClient from "@/lib/stream";

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return null;
  const [unreadNotificationCount, unreadMessageCount] = await Promise.all([
    prisma.notification.count({
      where: { recipientId: loggedInUser.id, read: false },
    }),
    (await streamServerClient.getUnreadCount(loggedInUser.id))
      .total_unread_count,
  ]);

  return (
    <div className={className}>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Home"
        asChild
      >
        <Link href="/">
          <Home />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      <NotificationsButton
        initialState={{ unreadCount: unreadNotificationCount }}
      />
      <MessagesButton initialState={{ unreadCount: unreadMessageCount }} />
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Bookmarks"
        asChild
      >
        <Link href="/bookmarks">
          <Bookmark />
          <span className="hidden lg:inline">Bookmarks</span>
        </Link>
      </Button>
    </div>
  );
}
