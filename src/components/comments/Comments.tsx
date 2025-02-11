import {PostData} from "@/lib/types";
import CommentInput from "@/components/comments/CommentInput";

/**
 * Comments client component.
 */
export interface CommentsProps {
  post: PostData;
}

export default function Comments(props: CommentsProps) {
  return (
    <div>
      <CommentInput post={props.post} />
    </div>
  );
}
