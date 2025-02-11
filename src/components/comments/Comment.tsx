import { CommentData } from "@/lib/types";
import UserTooltip from "@/components/UserTooltip";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import { formatRelativeDate } from "@/lib/utils";

interface CommentProps {
  comment: CommentData;
}

export default function Comment(props: CommentProps) {
  return (
    <div className="flex gap-3 py-3">
      <span className="hidden sm:inline">
        <UserTooltip user={props.comment.user}>
          <Link href={`/users/${props.comment.user.username}`}>
            <UserAvatar
              avatarUrl={props.comment.user.avatarUrl}
              size={40}
            ></UserAvatar>
          </Link>
        </UserTooltip>
      </span>
      <div>
        <div className="flex items-center gap-1 text-sm">
          <UserTooltip user={props.comment.user}>
            <Link
              href={`/users/${props.comment.user.username}`}
              className="font-medium hover:underline"
            >
              {props.comment.user.displayName}
            </Link>
          </UserTooltip>
          <span className="text-muted-foreground">
            {formatRelativeDate(props.comment.createdAt)}
          </span>
        </div>
        <div>{props.comment.content}</div>
      </div>
    </div>
  );
}
