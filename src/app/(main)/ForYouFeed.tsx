"use client";

import {PostData} from "@/lib/types";
import {useQuery} from "@tanstack/react-query";
import {Loader2} from "lucide-react";
import Post from "@/components/posts/Post";
import kyInstance from "@/lib/ky";

/**
 * Example of fetching data from an endpoint.
 * All data get a key and are cached through ReactQuery caching.
 * If the component is being opened again, we revalidate data using the key.
 * @constructor
 */
export default function ForYouFeed() {
  const query = useQuery<PostData[]>({
    queryKey: ["post-feed", "for-you"],
    /*The way to fetch data from endpoint without Ky*/
/*    queryFn: async () => {
      const res = await fetch("api/posts/for-you");

      if (!res.ok) {
        throw Error(`Request failed with status code ${res.status}`);
      }
      return res.json();
    },*/
    /*The way to fetch data from endpoint with Ky
    * Errorhandling is provided by Ky as well
    * */
    queryFn: kyInstance.get("api/posts/for-you").json<PostData[]>,
  });

  if (query.status === "pending") {
    return <Loader2 className="mx-auto animate-spin" />;
  }
  if (query.status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    );
  }
  return (
    <>
      {/*example of creating HTML content in loop*/}
      {query.data.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </>
  );
}
