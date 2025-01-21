import {Prisma} from "@prisma/client";

/**
 * Example of extracting a joined object:
 * we do have a user associated to posts.
 * To fetch a user together with their posts,
 * we use the `satisfies` key word.
 * Doing so, we kind of generating a type of Post data including a user (see below)
 * This one is equivalent to "postDataInclude = posts JOIN user"
 */
export const postDataInclude = {
  user: {
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
} satisfies Prisma.PostInclude;

/**
 * The included user is defined above.
 * Whenever we update the include, PostData is updated automatically.
 */
export type PostData = Prisma.PostGetPayload<{
  include: typeof postDataInclude;
}>;
