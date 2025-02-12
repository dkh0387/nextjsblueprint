import { NotificationData } from "@/lib/types";
import { NotificationType } from "@prisma/client";
import { Heart, MessageCircle, User2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/UserAvatar";

interface NotificationProps {
  notification: NotificationData;
}

export default function Notification(props: NotificationProps) {
  const notificationTypeMap: Record<
    NotificationType,
    { message: string; icon: JSX.Element; href: string }
  > = {
    FOLLOW: {
      message: `${props.notification.issuer.displayName} followed you`,
      icon: <User2 className="size-7 text-primary" />,
      href: `/users/${props.notification.issuer.username}`,
    },
    COMMENT: {
      message: `${props.notification.issuer.displayName} commented on your post`,
      icon: <MessageCircle className="size-7 fill-primary text-primary" />,
      href: `/posts/${props.notification.postId}`,
    },
    LIKE: {
      message: `${props.notification.issuer.displayName} liked your post`,
      icon: <Heart className="size-7 fill-red-500 text-red-500" />,
      href: `/posts/${props.notification.postId}`,
    },
  };

  const { message, icon, href } = notificationTypeMap[props.notification.type];
  return (
    <Link href={href} className="block">
      <article
        className={cn(
          "flex gap-3 rounded-2xl bg-card p-5 shadow-md transition-colors hover:bg-card/70",
          !props.notification.read && "bg-primary/10",
        )}
      >
        <div className="my-1">{icon}</div>
        <div className="space-y-3">
          <UserAvatar
            avatarUrl={props.notification.issuer.avatarUrl}
            size={36}
          />
          <div>
            <span className="font-bold">
              {props.notification.issuer.displayName}
            </span>{" "}
            <span>{message}</span>
          </div>
          {props.notification.post && (
            <div className="line-clamp-3 whitespace-pre-line text-muted-foreground">
              {props.notification.post.content}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
