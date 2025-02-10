import {validateRequest} from "@/auth";
import {prisma} from "@/lib/prisma";
import {getPostDataInclude, PostsPage} from "@/lib/types";
import {NextRequest} from "next/server";

/**
 * Route handler for fetching serverside data.
 * Actually similar to endpoints coming from Spring otherwise.
 * This one is a GET endpoint for all posts for the current user.
 */
export async function GET(req: NextRequest) {
  try {
    // pagination: id of the next post after the current page
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    //10 bookmarks per page
    const pageSize = 10;

    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: loggedInUser.id },
      include: {
        post: { include: getPostDataInclude(loggedInUser.id) },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1, // load 11 bookmarks
      cursor: cursor ? { id: cursor } : undefined,
    });

    // which post should be loaded on the next page first?
    const nextCursor =
      bookmarks.length > pageSize ? bookmarks[pageSize].id : null;

    const data: PostsPage = {
      posts: bookmarks.slice(0, pageSize).map((b) => b.post),
      nextCursor: nextCursor,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
