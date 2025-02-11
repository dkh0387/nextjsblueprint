import { CommentData } from "@/lib/types";
import LoadingButton from "../LoadingButton";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useDeleteCommentMutation } from "./mutations";

interface DeleteCommentDialogProps {
  comment: CommentData;
  open: boolean;
  onClose: () => void;
}

export default function DeleteCommentDialog(props: DeleteCommentDialogProps) {
  const mutation = useDeleteCommentMutation();

  /**
   * Only if the dialog is opened and deleting is not loading, we call onClose().
   * @param open
   */
  function handleOpenChange(open: boolean) {
    if (!open || !mutation.isPending) {
      props.onClose();
    }
  }

  // onOpenChange: listener for close opened dialog by clicking outside or close button.
  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete comment?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <LoadingButton
            variant="destructive"
            // NOTE: here we have as argument what the mutationFn DeleteComment() expects!
            onClick={() =>
              mutation.mutate(props.comment.id, { onSuccess: props.onClose })
            }
            loading={mutation.isPending}
          >
            Delete
          </LoadingButton>
          <Button
            variant="outline"
            onClick={props.onClose}
            // not allowed to close dialog while mutation is in progress
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
