import {NextRequest, NextResponse} from "next/server";
import {validateRequest} from "@/auth";
import {prisma} from "@/lib/prisma";
import {getPostDataInclude, PostsPage} from "@/lib/types";

/**
 * Feed fetching of all users whom the logged-in user is following.
 * @param req
 * @param res
 * @constructor
 */
export async function GET(req: NextRequest, res: NextResponse) {
  try {
    // pagination: id of the next post after the current page
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    //10 posts per page
    const pageSize = 10;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    /**
     * SELECT * FROM posts p INNER JOIN followers f ON p.userId = f.followerId;
     */
    const posts = await prisma.post.findMany({
      where: {
        user: {
          followers: {
            some: {
              followerId: user.id,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: getPostDataInclude(user.id),
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
