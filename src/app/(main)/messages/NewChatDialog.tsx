import {Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {DefaultStreamChatGenerics, useChatContext} from "stream-chat-react";
import {useToast} from "@/components/ui/use-toast";
import {useState} from "react";
import {useSession} from "@/app/(main)/SessionProvider";
import useDebounce from "@/hooks/useDebounce";
import {UserResponse} from "stream-chat";
import {useQuery} from "@tanstack/react-query";
import {Check, Loader2, Search, X} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

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
          {selectedUSers.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 p-2">
              {selectedUSers.map((user) => (
                <SelectedUserTag
                  user={user}
                  key={user.id}
                  onRemove={() => {
                    setSelectedUSers((prev) =>
                      prev.filter((u) => u.id !== user.id),
                    );
                  }}
                ></SelectedUserTag>
              ))}
            </div>
          )}
          <hr />
          <div className="h-96 overflow-y-auto">
            {isSuccess &&
              data?.users.map((user) => (
                <UserResult
                  key={user.id}
                  user={user}
                  selected={selectedUSers.some((u) => u.id === user.id)}
                  onClick={() => {
                    setSelectedUSers((prev) =>
                      prev.some((u) => u.id === user.id)
                        ? prev.filter((u) => u.id !== user.id)
                        : [...prev, user],
                    );
                  }}
                />
              ))}
            {isSuccess && data.users.length === 0 && (
              <p className="my-3 text-center text-muted-foreground">
                No users found. Try a different name.
              </p>
            )}
            {isFetching && <Loader2 className="mx-auto my-3 animate-spin" />}
            {isError && (
              <p className="my-3 text-center text-destructive">
                An error occurred while loading users.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Search result as a user avatar with name.
 */
interface UserResultProps {
  user: UserResponse<DefaultStreamChatGenerics>;
  selected: boolean;
  onClick: () => void;
}

function UserResult(props: UserResultProps) {
  return (
    <button
      onClick={props.onClick}
      className="hover: flex w-full items-center justify-between bg-muted/50 px-4 py-2.5 transition-colors"
    >
      <div className="flex items-center gap-2">
        <UserAvatar avatarUrl={props.user.image} />
        <div className="flex flex-col text-start">
          <p className="font-bold">{props.user.name}</p>
          <p className="text-muted-foreground">@{props.user.username}</p>
        </div>
      </div>
      {props.selected && <Check className="size-5 text-green-500" />}
    </button>
  );
}

/**
 * Tag for a selected user for (group)chat.
 */
interface SelectedUserTagProps {
  user: UserResponse<DefaultStreamChatGenerics>;
  onRemove: () => void;
}

function SelectedUserTag(props: SelectedUserTagProps) {
  return (
    <button
      onClick={props.onRemove}
      className="flex items-center gap-2 rounded-full border p-1 hover:bg-muted/50"
    >
      <UserAvatar avatarUrl={props.user.image} size={24} />
      <p className="font-bold">{props.user.name}</p>
      <X className="mx-2 size-5 text-muted-foreground" />
    </button>
  );
}
