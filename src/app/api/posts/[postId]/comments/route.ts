import {CommentsPage, getCommentDataInclude} from "@/lib/types";
import {validateRequest} from "@/auth";
import {NextRequest} from "next/server";
import {prisma} from "@/lib/prisma";

/**
 * Endpoints for dealing with comments on posts.
 * @constructor
 */
export async function GET(
  req: NextRequest,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    // pagination: id of the next post after the current page
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    //5 comments per page
    const pageSize = 5;

    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: getCommentDataInclude(loggedInUser.id),
      orderBy: { createdAt: "asc" },
      // paginate in opposite direction
      take: (pageSize + 1) * -1,
      cursor: cursor ? { id: cursor } : undefined,
    });
    const previousCursor = comments.length > pageSize ? comments[0].id : null;
    const data: CommentsPage = {
      comments: comments.length > pageSize ? comments.slice(1) : comments,
      previousCursor,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
