import {validateRequest} from "@/auth";
import {prisma} from "@/lib/prisma";
import {LikeInfo} from "@/lib/types";

/**
 * Endpoint for likes of a post.
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
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likes: {
          where: {
            userId: loggedInUser.id,
          },
          select: {
            userId: true,
          },
        },
        _count: {
          select: { likes: true },
        },
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }
    const data: LikeInfo = {
      likes: post._count.likes,
      isLikedByLoggedInUser: !!post.likes.length,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Endpoint to add a new like.
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
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }
    // Example of prisma transaction: only after creating a like succeed we create a notification
    await prisma.$transaction([
      // create if not exists, otherwise ignore
      prisma.like.upsert({
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
      }),
      ...(loggedInUser.id !== post.userId
        ? [
            // if the post was liked by the logged-in user, we create a new notification for the post-author
            prisma.notification.create({
              data: {
                issuerId: loggedInUser.id,
                recipientId: post.userId,
                postId: postId,
                type: "LIKE",
              },
            }),
          ]
        : []),
    ]);

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Endpoint to delete a like.
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
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }
    await prisma.$transaction([
      // delete it if exists, otherwise ignore
      prisma.like.deleteMany({
        where: {
          userId: loggedInUser.id,
          postId: postId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: post.userId,
          postId,
          type: "LIKE",
        },
      }),
    ]);

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
