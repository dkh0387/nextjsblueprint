import {PostData} from "@/lib/types";
import React, {useState} from "react";
import {useSubmitCommentMutation} from "@/components/comments/mutations";
import {Button} from "@/components/ui/button";
import {Loader2, SendHorizonal} from "lucide-react";
import {Input} from "@/components/ui/input";

/**
 * A form for submitting a new comment on post.
 */
interface CommentInputProps {
  post: PostData;
}

export default function CommentInput({ post }: CommentInputProps) {
  const [input, setInput] = useState("");

  const mutation = useSubmitCommentMutation(post.id);

  /**
   * Since we don't use the react hook form we just receive a React.FormEvent<HTMLFormElement>.
   * e.preventDefault(): per default submitting a form will refresh the page, but we don't want that.
   * @param e
   */
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!input) return;

    mutation.mutate(
      {
        post,
        content: input,
      },
      {
        onSuccess: () => setInput(""),
      },
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full items-center gap-2">
      <Input
        placeholder="Write a comment..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={!input.trim() || mutation.isPending}
      >
        {!mutation.isPending ? (
          <SendHorizonal />
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </Button>
    </form>
  );
}
