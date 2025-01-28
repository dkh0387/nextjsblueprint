"use server";

import { validateRequest } from "@/auth";
import { postSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";

export async function submitPost(input: string) {
  // look up if the user is authorized
  const { user } = await validateRequest();

  console.log(user);

  if (!user) throw Error("Unauthorized");

  const { content } = postSchema.parse({ content: input });

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id,
    },
    include: getPostDataInclude(user.id),
  });

  return newPost;
}
