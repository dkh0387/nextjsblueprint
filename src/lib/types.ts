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
 * This one is equivalent to "postDataInclude = posts JOIN user JOIN attachments JOIN bookmarks JOIN comments"
 */
export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getFollowingUserDataSelect(loggedInUserId),
    },
    attachments: true,
    likes: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    bookmarks: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
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

export function getCommentDataInclude(loggedInUserId: string) {
  return {
    user: { select: getFollowingUserDataSelect(loggedInUserId) },
  } satisfies Prisma.CommentInclude;
}

export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

export interface CommentsPage {
  comments: CommentData[];
  // we paginate comments asc
  previousCursor: string | null;
}

export const notificationsInclude = {
  issuer: {
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
  post: {
    select: { content: true },
  },
} satisfies Prisma.NotificationInclude;

export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude;
}>;

export interface NotificationsPage {
  notifications: NotificationData[];
  nextCursor: string | null;
}

export interface FollowerInfo {
  followers: number;
  isFollowedByLoggedInUser: boolean;
}

export interface LikeInfo {
  likes: number;
  isLikedByLoggedInUser: boolean;
}

export interface BookmarkInfo {
  isBookmarkedByLoggedInUser: boolean;
}
