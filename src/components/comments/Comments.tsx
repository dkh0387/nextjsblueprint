import {CommentsPage, PostData} from "@/lib/types";
import CommentInput from "@/components/comments/CommentInput";
import {useInfiniteQuery} from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import Comment from "@/components/comments/Comment";
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";

/**
 * Comments client component.
 */
export interface CommentsProps {
  post: PostData;
}

export default function Comments(props: CommentsProps) {
  const { data, fetchNextPage, hasNextPage, isFetching, status } =
    useInfiniteQuery({
      queryKey: ["comments", props.post.id],
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            `api/posts/${props.post.id}/comments`,
            pageParam ? { searchParams: { cursor: pageParam } } : {},
          )
          .json<CommentsPage>(),
      initialPageParam: null as string | null,
      getNextPageParam: (firstPage) => firstPage.previousCursor,
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
    });

  const comments = data?.pages.flatMap((page) => page.comments) || [];
  return (
    <div className="space-y-3">
      <CommentInput post={props.post} />
      {hasNextPage && (
        <Button
          variant="link"
          className="mx-auto block"
          disabled={isFetching}
          onClick={() => fetchNextPage()}
        >
          Load previous comments
        </Button>
      )}
      {status === "pending" && <Loader2 className="mx-auto animate-spin" />}
      {status === "success" && !comments.length && (
        <p className="text-center text-muted-foreground">No comments yet.</p>
      )}
      {status === "error" && (
        <p className="text-center text-destructive">
          An error occurred while loading comments.
        </p>
      )}
      {/*divide-y: vertical division line between the comments*/}
      <div className="divide-y">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
