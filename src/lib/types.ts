import { Prisma } from "@prisma/client";

export function getFollowingUserDataSelect(loggedInUserId: string) {
  return {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    bio: true,
    createdAt: true,
    followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    _count: {
      select: {
        posts: true,
        followers: true,
      },
    },
  } satisfies Prisma.UserSelect;
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getFollowingUserDataSelect>;
}>;

/**
 * Example of extracting a joined object:
 * we do have a user associated to posts.
 * To fetch a user together with their posts,
 * we use the `satisfies` key word.
 * Doing so, we kind of generating a type of Post data including a user (see below)
 * This one is equivalent to "postDataInclude = posts JOIN user"
 * Similary, we fetch the attachments.
 */
export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getFollowingUserDataSelect(loggedInUserId),
    },
    attachments: true,
  } satisfies Prisma.PostInclude;
}

/**
 * The included user is defined above.
 * Whenever we update the include, PostData is updated automatically.
 */
export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}

export interface FollowerInfo {
  followers: number;
  isFollowedByLoggedInUser: boolean;
}
