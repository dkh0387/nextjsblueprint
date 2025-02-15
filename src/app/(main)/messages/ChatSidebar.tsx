import { useSession } from "@/app/(main)/SessionProvider";
import {
  ChannelList,
  ChannelPreviewMessenger,
  ChannelPreviewUIComponentProps,
  useChatContext,
} from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { MailPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import NewChatDialog from "@/app/(main)/messages/NewChatDialog";
import { useQueryClient } from "@tanstack/react-query";

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function ChatSidebar({ open, onClose }: ChatSidebarProps) {
  const { user: loggedInUser } = useSession();
  const queryClient = useQueryClient();
  const { channel } = useChatContext();

  // Invalidate the cache whenever the unread messages count changes
  // Everytime we select on a chat channel in the chat sidebar the cache is being invalidated
  useEffect(() => {
    if (channel?.id) {
      queryClient.invalidateQueries({ queryKey: ["unread-message-count"] });
    }
  }, [channel?.id, queryClient]);

  // Custom channel preview component with custom on click behavior (selecting a channel close the sidebar).
  // We put it inside the ChatSidebar, because we only need to preview it if a new chat starts.
  // useCallback prevents it from rendering any time new if the ChatSidebar is being rendered.
  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <ChannelPreviewMessenger
        {...props}
        onSelect={() => {
          props.setActiveChannel?.(props.channel, props.watchers);
          onClose();
        }}
      />
    ),
    [onClose],
  );

  return (
    <div
      className={cn(
        "size-full flex-col border-e md:flex md:w-72",
        open ? "flex" : "hidden",
      )}
    >
      <MenuHeader onClose={onClose} />
      {/*Only show channels for the logged-in user*/}
      <ChannelList
        filters={{
          type: "messaging",
          members: { $in: [loggedInUser.id] },
        }}
        showChannelSearch
        /*show 8 users as default and show more button for pagination*/
        options={{ state: true, presence: true, limit: 8 }}
        /*latest message on the top*/
        sort={{ last_message_at: -1 }}
        /*search not only by user but also by channels*/
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: {
            channelFilters: {
              filters: { members: { $in: [loggedInUser.id] } },
            },
          },
        }}
        Preview={ChannelPreviewCustom}
      />
    </div>
  );
}

/**
 * Custom header over the search input field.
 */
interface MenuHeaderProps {
  onClose: () => void;
}

function MenuHeader({ onClose }: MenuHeaderProps) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  return (
    <>
      <div className="flex items-center gap-3 p-2">
        <div className="h-full md:hidden">
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>
        <h1 className="me-auto text-xl font-bold md:ms-2">Messages</h1>
        <Button
          size="icon"
          variant="ghost"
          title="Start new chat"
          onClick={() => setShowNewChatDialog(true)}
        >
          <MailPlus className="size-5" />
        </Button>
      </div>
      {/*We render the dialog conditionally because we fetch data for it.
             If we render it anytime, data is being fetched anytime*/}
      {showNewChatDialog && (
        <NewChatDialog
          onOpenChange={setShowNewChatDialog}
          onChatCreated={() => {
            setShowNewChatDialog(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
