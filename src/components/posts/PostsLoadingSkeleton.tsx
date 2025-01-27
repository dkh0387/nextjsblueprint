import {Skeleton} from "@/components/ui/skeleton";

/**
 * We just show three skeletons while loading.
 * @constructor
 */
export default function PostsLoadingSkeleton() {
  return (
    <div className="space-y-5">
      <PostLoadingSkeleton />
      <PostLoadingSkeleton />
      <PostLoadingSkeleton />
    </div>
  );
}

/**
 * Skeleton for a post, being shown only while loading.
 * @constructor
 */
function PostLoadingSkeleton() {
  return (
    <div className="animate-pulse, w-full space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex flex-wrap gap-3">
        {/*Image of the poster*/}
        <Skeleton className="size-12 rounded-full" />
        <div className="space-y-1.5">
          {/*Name of the poster*/}
          <Skeleton className="h-4 w-24 rounded" />
          {/*Date of the post*/}
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      </div>
      {/*Content of the post*/}
      <Skeleton className="h-16 rounded" />
    </div>
  );
}
