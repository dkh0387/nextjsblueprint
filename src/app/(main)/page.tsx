import PostEditor from "@/components/posts/editor/PostEditor";
import TrendsSideBar from "@/components/TrendsSideBar";
import ForYouFeed from "@/app/(main)/ForYouFeed";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import FollowingFeed from "@/app/(main)/FollowingFeed";

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
        <Tabs defaultValue="for-you">
          <TabsList>
            <TabsTrigger value="for-you">For you</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="for-you">
            <ForYouFeed />
          </TabsContent>
          <TabsContent value="following">
            <FollowingFeed />
          </TabsContent>
        </Tabs>
      </div>
      <TrendsSideBar />
    </main>
  );
}
