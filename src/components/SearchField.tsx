"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export default function SearchField() {
  const router = useRouter();

  /**
   * This logic works only if JS is enabled,
   * otherwise we get back to GET request with all form params in the url.
   * @param e
   */
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // avoiding refreshing the form if we submit
    e.preventDefault();
    const form = e.currentTarget;
    const searchQuery = (form.q as HTMLInputElement).value.trim();

    if (!searchQuery) return;
    // some symbols like # have special codes within urls, so we need to encode for escaping it
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  }

  return (
    <form onSubmit={handleSubmit} method="GET" action="/search">
      <div className="relative">
        <Input name="q" placeholder="search" className="pe-10"></Input>
        <SearchIcon className="trasform absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"></SearchIcon>
      </div>
    </form>
  );
}
