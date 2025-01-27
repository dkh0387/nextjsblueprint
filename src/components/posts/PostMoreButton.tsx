import {useState} from "react";
import DeletePostDialog from "@/components/posts/DeletePostDialog";
import {PostData} from "@/lib/types";
import {DropdownMenu, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {MoreHorizontal} from "lucide-react";

/**
 * Three dots button in the upper right corner of the post-content.
 */
interface PostMoreButtonProps {
  post: PostData;
  className?: string;
}

export default function PostMoreButton(props: PostMoreButtonProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className={props.className}>
            <MoreHorizontal className="size-5 text-muted-foreground"></MoreHorizontal>
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
      <DeletePostDialog
        post={props.post}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      ></DeletePostDialog>
    </>
  );
}
