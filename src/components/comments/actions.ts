"use server";

import { getCommentDataInclude, PostData } from "@/lib/types";
import { validateRequest } from "@/auth";
import { createCommentSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function submitComment({
  post,
  content,
}: {
  post: PostData;
  content: string;
}) {
  // look up if the user is authorized
  const { user: loggedInUser } = await validateRequest();

  console.log(loggedInUser);

  if (!loggedInUser) throw Error("Unauthorized");

  const { content: contentValidated } = createCommentSchema.parse({ content });

  const newComment = await prisma.comment.create({
    data: {
      content: contentValidated,
      postId: post.id,
      userId: loggedInUser.id,
    },
    include: getCommentDataInclude(loggedInUser.id),
  });
  return newComment;
}

export async function deleteComment(id: string) {
  // look up if the user is authorized
  const { user: loggedInUser } = await validateRequest();

  console.log(loggedInUser);

  if (!loggedInUser) throw Error("Unauthorized");

  const comment = await prisma.comment.findUnique({ where: { id } });

  if (!comment) throw Error("Comment not found");

  if (comment.userId !== loggedInUser.id) throw Error("Unauthorized");
  const deletedComment = await prisma.comment.delete({
    where: { id },
    include: getCommentDataInclude(loggedInUser.id),
  });
  return deletedComment;
}
