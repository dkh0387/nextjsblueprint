"use server";

import {validateRequest} from "@/auth";
import {prisma} from "@/lib/prisma";
import {Suspense} from "react";
import {Loader2} from "lucide-react";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import {unstable_cache} from "next/cache";
import {formatNumber} from "@/lib/utils";
import FollowButton from "@/components/FollowButton";
import {getFollowingUserDataSelect} from "@/lib/types";
import UserTooltip from "@/components/UserTooltip";

/**
 * Trends sidebar as a reusable component.
 * It is specific to a page
 * This one is not pretended to be shown within the main frame,
 * otherwise we would put in `/(main)`.
 * Content: who to follow and hashtags.
 * @constructor
 *
 * Problem: we have a server component here, because we are fetching data,
 * so the page where this component is used will wait until the data is fetched and reload then.
 * It is a bad user experience, we need a loading indicator while fetching...
 */
export default async function TrendsSideBar() {
  return (
    /*hidden on small screens, middle screens is block and large screens is fixed width */
    <div className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <WhoToFollow></WhoToFollow>
        <TrendingTopics></TrendingTopics>
      </Suspense>
    </div>
  );
}

async function WhoToFollow() {
  const { user } = await validateRequest();

  if (!user) return null;

  /* SELECT id, username, displayName, avatarUrl, FROM users INNER JOIN followers
   * WHERE id !=: user.id
   * AND followers.followerId !=: user.id                                                                                                                                                                                 */
  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: user.id,
      },
      followers: {
        none: {
          followerId: user.id,
        },
      },
    },
    select: getFollowingUserDataSelect(user.id),
    take: 5,
  });
  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Who to follow</div>
      {usersToFollow.map((user) => (
        <div key={user.id} className="flex items-center justify-between gap-3">
          <UserTooltip user={user}>
            <Link
              href={`/users/${user.username}`}
              className="flex items-center gap-3"
            >
              <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
              <div>
                {/*line-clamp-1: if the text is too long for one line, dots are shown*/}
                <p className="line-clamp-1 break-all font-semibold hover:underline">
                  {user.displayName}
                </p>
                <p className="line-clamp-1 break-all text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </Link>
          </UserTooltip>
          <FollowButton
            userId={user.id}
            initialState={{
              followers: user._count.followers,
              isFollowedByLoggedInUser: user.followers.some(
                ({ followerId }) => followerId === user.id,
              ),
            }}
          />
        </div>
      ))}
    </div>
  );
}

/*Caching requested data serverside.Makes sense for heavy db fetching.This one is a Next.js feature. */
const getTrendingTopics = unstable_cache(
  async () => {
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
            SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
            FROM posts
            GROUP BY (hashtag)
            ORDER BY count DESC, hashtag ASC
                LIMIT 5
        `;
    const map = result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
    return map;
  },
  ["trending_topics"],
  { revalidate: 3 * 60 * 60 }, // caching for 3 hours
);

async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Trending topics</div>
      {trendingTopics.map(({ hashtag, count }) => {
        const title = hashtag.split("#")[1];
        return (
          <Link key={title} href={`/hashtag/${title}`} className="block">
            <p
              className="line-clamp-1 break-all font-semibold hover:underline"
              title={hashtag}
            >
              {hashtag}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatNumber(count)} {count === 1 ? "post" : "posts"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
