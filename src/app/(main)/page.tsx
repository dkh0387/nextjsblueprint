import PostEditor from "@/components/posts/editor/PostEditor";
import TrendsSideBar from "@/components/TrendsSideBar";
import ForYouFeed from "@/app/(main)/ForYouFeed";

/**
 * NOTE: it is a server component, so the page DOES NOT refresh automatically (yet).
 * @constructor
 */
export default function Home() {
  return (
    /*flex: align elements horizontally*/
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        <ForYouFeed />
      </div>
      <TrendsSideBar />
    </main>
  );
}
