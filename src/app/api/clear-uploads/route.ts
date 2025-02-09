import {prisma} from "@/lib/prisma";
import {UTApi} from "uploadthing/server";

/**
 * Secure GET endpoint for deleting attachments.
 * @param req
 * @constructor
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json(
        { error: "Invalid authorization header" },
        { status: 401 },
      );
    }
    /*
                                fetch only media without a post id.
                                SELECT * FROM media WHERE postId IS NULL AND createdAt <= NOW() - 24h
                                 */
    const unusedMedia = await prisma.media.findMany({
      where: {
        postId: null,
        ...(process.env.NODE_ENV === "production"
          ? {
              created_at: {
                lte: new Date(Date.now() - 1000 * 60 * 60 * 24),
              },
            }
          : {}),
      },
      select: {
        id: true,
        url: true,
      },
    });
    // split only the file ids
    await new UTApi().deleteFiles(
      unusedMedia.map(
        (m) =>
          m.url.split(`/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`)[1],
      ),
    );
    await prisma.media.deleteMany({
      where: {
        id: {
          in: unusedMedia.map((m) => m.id),
        },
      },
    });
    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
