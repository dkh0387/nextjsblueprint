import {validateRequest} from "@/auth";
import {prisma} from "@/lib/prisma";
import {postDataInclude} from "@/lib/types";

/**
 * Route handler for fetching serverside data.
 * Actually similar to endpoints coming from Spring otherwise.
 * This one is a GET endpoint for all posts for the current user.
 */
export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const posts = await prisma.post.findMany({
      include: postDataInclude,
      orderBy: { createdAt: "desc" },
    });
    return Response.json(posts);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
