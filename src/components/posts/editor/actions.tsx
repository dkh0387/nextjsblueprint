"use server";

import { validateRequest } from "@/auth";
import { postSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
}) {
  // look up if the user is authorized
  const { user } = await validateRequest();

  console.log(user);

  if (!user) throw Error("Unauthorized");

  const { content, mediaIds } = postSchema.parse(input);

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id,
      // ID of the newPost is connected to all media attachments on the fly.
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getPostDataInclude(user.id),
  });

  return newPost;
}
