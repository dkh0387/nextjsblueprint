import {
  Channel,
  ChannelHeader,
  ChannelHeaderProps,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface ChatChannelProps {
  open: boolean;
  openSidebar: () => void;
}

export default function ChatChannel(props: ChatChannelProps) {
  return (
    /*show both, sidebar and chat channel on medium screens*/
    <div className={cn("w-full md:block", !props.open && "hidden")}>
      <Channel>
        <Window>
          <CustomChannelHeader openSidebar={props.openSidebar} />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
}

/**
 * Custom channel header with a button to show/hide the channel sidebar.
 */
interface CustomChannelHeaderProps extends ChannelHeaderProps {
  openSidebar: () => void;
}

function CustomChannelHeader({
  openSidebar,
  ...props
}: CustomChannelHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-full p-2 md:hidden">
        <Button size="icon" variant="ghost" onClick={openSidebar} title="Show channels">
          <Menu className="size-5" />
        </Button>
      </div>
      <ChannelHeader {...props} />
    </div>
  );
}
