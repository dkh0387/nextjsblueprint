import {createUploadthing, FileRouter} from "uploadthing/next";
import {validateRequest} from "@/auth";
import {UploadThingError} from "@uploadthing/shared";
import {prisma} from "@/lib/prisma";

/**
 * Uploadthing file router.
 */
const f = createUploadthing();

export const fileRouter = {
  avatar: f({
    image: { maxFileSize: "512KB" },
  })
    // User validation has to appear before the upload starts.
    // User data are passed to the metadate below.
    .middleware(async () => {
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized");
      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // We need to use a unique url according to our app,
      // otherwise anyone could use it.
      // The new url has to be whitelisted in next.config.mjs
      const newAvatarUrl = file.url.replace(
        "/f/",
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}`,
      );
      await prisma.user.update({
        where: { id: metadata.user.id },
        data: {
          avatarUrl: newAvatarUrl,
        },
      });
      return { avatarUrl: newAvatarUrl };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
