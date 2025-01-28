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
    //10 posts per page
    const pageSize = 10;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const posts = await prisma.post.findMany({
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1, // load 11 posts
      cursor: cursor ? { id: cursor } : undefined,
    });

    // which post should be loaded on the next page first?
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor: nextCursor,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
