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
      />
    </div>
  );
}
