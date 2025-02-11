import {PostData} from "@/lib/types";

/**
 * Comments client component.
 */
export interface CommentsProps {
  post: PostData;
}

export default function Comments(props: CommentsProps) {
  return <div>Comments</div>;
}
