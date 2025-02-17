import {Metadata} from "next";
import TrendsSideBar from "@/components/TrendsSideBar";
import SearchResults from "@/app/(main)/search/SearchResults";

/**
 * Fulltext search result page.
 */
interface PageProps {
  // search param, see [src/components/SearchField.tsx]
  searchParams: { q: string };
}

export function generateMetadata(props: PageProps): Metadata {
  return { title: `Search results for "${props.searchParams.q}"` };
}

export default function Page(props: PageProps) {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="line-clamp-2 break-all text-center text-2xl font-bold">
            Search results for &quot;{props.searchParams.q}&quot;
          </h1>
        </div>
        <SearchResults query={props.searchParams.q} />
      </div>
      <TrendsSideBar />
    </main>
  );
}
