import {NextRequest} from "next/server";
import {validateRequest} from "@/auth";
import {prisma} from "@/lib/prisma";
import {getPostDataInclude, PostsPage} from "@/lib/types";

/**
 * Endpoint for fetching search results.
 * @param req
 * @constructor
 */
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    // pagination: id of the next post after the current page
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    // Postgres search
    // denis khaskin --> denis & khaskin
    // this search for denis AND khaskin
    const searchQuery = q.split(" ").join(" & ");

    //10 posts per page
    const pageSize = 10;

    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    /**
     * Search for post-content OR user displayname OR username.
     */
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            content: {
              search: searchQuery,
            },
          },
          {
            user: {
              displayName: {
                search: searchQuery,
              },
            },
          },
          {
            user: {
              username: {
                search: searchQuery,
              },
            },
          },
        ],
      },
      include: getPostDataInclude(loggedInUser.id),
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
