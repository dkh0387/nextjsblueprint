import PostEditor from "@/components/posts/editor/PostEditor";
import {prisma} from "@/lib/prisma";
import Post from "@/components/posts/Post";
import {postDataInclude} from "@/lib/types";

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
    <main className="w-full min-w-0">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor></PostEditor>
        {/*example of creating HTML content in loop*/}
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
}
