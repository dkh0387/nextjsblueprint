import { useSession } from "@/app/(main)/SessionProvider";
import { ChannelList } from "stream-chat-react";

export default function ChatSidebar() {
  const { user: loggedInUser } = useSession();
  return (
    <div className="flex size-full flex-col border-e md:w-72">
      {/*Only show channels for the logged-in user*/}
      <ChannelList
        filters={{
          type: "messaging",
          members: { $in: [loggedInUser.id] },
        }}
        showChannelSearch
      />
    </div>
  );
}
