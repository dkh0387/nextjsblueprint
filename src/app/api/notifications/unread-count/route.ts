import {validateRequest} from "@/auth";
import {prisma} from "@/lib/prisma";
import {NotificationCountInfo} from "@/lib/types";

/**
 * Endpoint for the number of unread notifications.
 */
export async function GET() {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const unreadCount = await prisma.notification.count({
      where: { recipientId: loggedInUser.id, read: false },
    });
    const data: NotificationCountInfo = {
      unreadCount: unreadCount,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
