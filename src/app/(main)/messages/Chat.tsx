"use client";

import useInitializeChatClient from "@/app/(main)/messages/useInitializeChatClient";
import {Loader2} from "lucide-react";
import {Chat as StreamChat} from "stream-chat-react";
import ChatSidebar from "@/app/(main)/messages/ChatSidebar";
import ChatChannel from "@/app/(main)/messages/ChatChannel";

/**
 * Stream Chat functionality.
 *
 * Chat client can be null before the client has been initialized.
 * @constructor
 */
export default function Chat() {
  const chatClient = useInitializeChatClient();

  if (!chatClient) {
    return <Loader2 className="mx-auto my-3 animate-spin" />;
  }
  return (
    <main className="relative w-full overflow-hidden rounded-2xl bg-card shadow-sm">
      {/*chat window as big as possible*/}
      <div className="absolute bottom-0 top-0 flex w-full">
        <StreamChat client={chatClient}>
          <ChatSidebar />
          <ChatChannel />
        </StreamChat>
      </div>
    </main>
  );
}
