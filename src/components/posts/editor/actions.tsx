"use server";

import { validateRequest } from "@/auth";
import { postSchema, PostValue } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function submitPost(input: PostValue) {
  // look up if the user is authorized
  const { user } = await validateRequest();

  if (!user) throw Error("Unauthorized");

  const { content } = postSchema.parse(input);

  await prisma.post.create({
    data: {
      content,
      userId: user.id,
    },
  });

  /**
   * Revalidating a path after a post was commited:
   * only makes sense if we want to refresh a server component,
   * but our components, which we want to refresh, are client components
   * We have to update them through React queries APIs later.
   */
}
