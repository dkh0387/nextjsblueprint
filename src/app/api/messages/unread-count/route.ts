import {validateRequest} from "@/auth";
import {MessageCountInfo} from "@/lib/types";
import streamServerClient from "@/lib/stream";

/**
 * Endpoint for the number of unread messages.
 */
export async function GET() {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const {total_unread_count} = await streamServerClient.getUnreadCount(
      loggedInUser.id,
    );
    const data: MessageCountInfo = {
      unreadCount: total_unread_count,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
