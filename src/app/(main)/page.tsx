import PostEditor from "@/components/posts/editor/PostEditor";
import {prisma} from "@/lib/prisma";
import Post from "@/components/posts/Post";
import {postDataInclude} from "@/lib/types";
import TrendsSideBar from "@/components/TrendsSideBar";

/**
 * NOTE: it is a server component, so the page DOES NOT refresh automatically (yet).
 * @constructor
 */
export default async function Home() {
  const posts = await prisma.post.findMany({
    // example of using JOIN in prisma
    include: postDataInclude,
    orderBy: { createdAt: "desc" },
  });
  return (
    /*flex: align elements horizontally*/
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor></PostEditor>
        {/*example of creating HTML content in loop*/}
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
      <TrendsSideBar></TrendsSideBar>
    </main>
  );
}
