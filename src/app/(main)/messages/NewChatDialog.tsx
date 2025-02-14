import {Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {DefaultStreamChatGenerics, useChatContext,} from "stream-chat-react";
import {useToast} from "@/components/ui/use-toast";
import {useState} from "react";
import {useSession} from "@/app/(main)/SessionProvider";
import useDebounce from "@/hooks/useDebounce";
import {UserResponse} from "stream-chat";
import {useQuery} from "@tanstack/react-query";
import {Search} from "lucide-react";

/**
 * New Chat dialog, opens by click on MailPlus icon in header of chat sidebar.
 */
interface NewChatDialogProps {
  onOpenChange: (open: boolean) => void;
  onChatCreated: () => void;
}

export default function NewChatDialog(props: NewChatDialogProps) {
  // We don't need this to be a client component to use the hook
  // because the parent component is already a client component
  const { client, setActiveChannel } = useChatContext();
  const { toast } = useToast();
  const { user: loggedInUser } = useSession();
  const [searchInput, setSearchInput] = useState("");
  // debounced search value after the delay passed
  const searchInputDebounced = useDebounce(searchInput);
  // multiselect users for a new (group)chat
  const [selectedUSers, setSelectedUSers] = useState<
    UserResponse<DefaultStreamChatGenerics>[]
  >([]);
  // We cache the search, every search result is being cached after the key of searchInputDebounced
  // queryFn doesn't run again unless the queryKey changes
  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["stream-users", searchInputDebounced],
    queryFn: async () =>
      client.queryUsers(
        {
          id: { $ne: loggedInUser.id },
          role: { $ne: "admin" },
          ...(searchInputDebounced
            ? {
                $or: [
                  // TODO: only search for searchInputDebounced in name or username fields,
                  //  customize if needed
                  { name: { $autocomplete: searchInputDebounced } },
                  { username: { $autocomplete: searchInputDebounced } },
                ],
              }
            : {}),
        },
        // sort by name and username
        { name: 1, username: 1 },
        // show 15 only
        { limit: 15 },
      ),
  });

  return (
    <Dialog open onOpenChange={props.onOpenChange}>
      <DialogContent className="bg-card p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
        <div>
          <div className="group relative">
            <Search className="absolute left-5 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground group-focus-within:text-primary" />
            <input
              placeholder="Search users..."
              className="focus: h-12 w-full pe-4 ps-14 outline-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
