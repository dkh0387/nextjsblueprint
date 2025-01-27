import { PostData } from "@/lib/types";
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
import { useDeletePostMutation } from "./mutations";

interface DeletePostDialogProps {
  post: PostData;
  open: boolean;
  onClose: () => void;
}

export default function DeletePostDialog(props: DeletePostDialogProps) {
  const mutation = useDeletePostMutation();

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
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <LoadingButton
                variant="destructive"
                // NOTE: here we have as argument what the mutationFn DeletePost() expects!
                onClick={() => mutation.mutate(props.post.id, { onSuccess: props.onClose })}
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
