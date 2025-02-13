import {Metadata} from "next";
import Chat from "@/app/(main)/messages/Chat";

/**
 * Main page for messages, reachable from the sidebar menu.
 * We need this page component because we can only set metadata in a server component.
 */
export const metadata: Metadata = {
  title: "Messages",
};

export default function Page() {
  return <Chat />;
}
