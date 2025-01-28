import {validateRequest} from "@/auth";
import {prisma} from "@/lib/prisma";
import {FollowerInfo} from "@/lib/types";

/**
 * Endpoint for fetching followers of a user, whom we are following.
 * [userId] is an url parameter per definition (see directory structure),
 * so we have to define a type for it like below.
 * @param req
 * @param userId
 * @constructor
 */
export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: {
            followerId: loggedInUser.id,
          },
          select: {
            follower: true,
          },
        },
        _count: {
          select: { followers: true },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const data: FollowerInfo = {
      followers: user._count.followers,
      // if the length is not zero then true
      isFollowedByLoggedInUser: !!user.followers.length,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
