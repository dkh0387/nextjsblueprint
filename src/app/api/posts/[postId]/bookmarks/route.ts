import {validateRequest} from "@/auth";
import {prisma} from "@/lib/prisma";
import {BookmarkInfo} from "@/lib/types";

/**
 * Endpoint for bookmarks of a post.
 * @param req
 * @param userId
 * @constructor
 */
export async function GET(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: loggedInUser.id,
          postId,
        },
      },
    });
    const data: BookmarkInfo = {
      isBookmarkedByLoggedInUser: !!bookmark,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Endpoint to add a new bookmark.
 * @param req
 * @param postId
 * @constructor
 */
export async function POST(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    // create if not exists, otherwise ignore
    await prisma.bookmark.upsert({
      where: {
        userId_postId: {
          userId: loggedInUser.id,
          postId: postId,
        },
      },
      create: {
        userId: loggedInUser.id,
        postId: postId,
      },
      update: {},
    });
    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Endpoint to delete a bookmark.
 * @constructor
 */
export async function DELETE(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    // delete it if exists, otherwise ignore
    await prisma.bookmark.deleteMany({
      where: {
        userId: loggedInUser.id,
        postId: postId,
      },
    });
    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
