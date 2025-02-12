import {validateRequest} from "@/auth";
import {prisma} from "@/lib/prisma";
import {notificationsInclude, NotificationsPage,} from "@/lib/types";
import {NextRequest} from "next/server";

/**
 * Route handler for fetching notifications.
 * Actually similar to endpoints coming from Spring otherwise.
 * This one is a GET endpoint for all posts for the current user.
 */
export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const notifications = await prisma.notification.findMany({
      where: { recipientId: loggedInUser.id },
      include: notificationsInclude,
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    // which post should be loaded on the next page first?
    const nextCursor =
      notifications.length > pageSize ? notifications[pageSize].id : null;

    const data: NotificationsPage = {
      notifications: notifications.slice(0, pageSize),
      nextCursor: nextCursor,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
