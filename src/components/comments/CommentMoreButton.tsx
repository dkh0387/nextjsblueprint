import { CommentData } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import DeleteCommentDialog from "@/components/comments/DeleteCommentDialog";

interface CommentMoreButtonProps {
  comment: CommentData;
  className?: string;
}

export default function CommentMoreButton(props: CommentMoreButtonProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className={props.className}>
            <MoreHorizontal className="size-5 text-muted-foreground"></MoreHorizontal>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            /*by clicking we show the conformation delete dialog*/
            onClick={() => setShowDeleteDialog(true)}
          >
            {/*text-destructive: red text*/}
            <span className="flex items-center gap-3 text-destructive">
              <Trash2 className="size-4"></Trash2>
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteCommentDialog
        comment={props.comment}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      ></DeleteCommentDialog>
    </>
  );
}
