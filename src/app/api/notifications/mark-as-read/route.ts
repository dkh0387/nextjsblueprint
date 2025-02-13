import {validateRequest} from "@/auth";
import {prisma} from "@/lib/prisma";

/**
 * Endpoint for marking notifications as read.
 */
export async function PATCH() {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    await prisma.notification.updateMany({
      where: { recipientId: loggedInUser.id, read: false },
      data: {
        read: true,
      },
    });
    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
