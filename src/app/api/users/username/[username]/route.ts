import {validateRequest} from "@/auth";
import {prisma} from "@/lib/prisma";
import {getFollowingUserDataSelect} from "@/lib/types";

/**
 * Endpoint for clientside fetching of user data by username required for the [UserTooltip].
 * api/users/username/?[username]
 * @param req
 * @param username
 * @constructor
 */
export async function GET(
    req: Request,
    { params: { username } }: { params: { username: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: getFollowingUserDataSelect(loggedInUser.id),
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}