import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDate, formatDistanceToNowStrict } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(from: Date) {
  const currentDate = new Date();
  // if the post is less than 24 hours ago, then we show like "17 hours ago"
  if (currentDate.getTime() - from.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(from, { addSuffix: true });
  }
  // if the post is older than 24 hours...
  else {
    // if the same year, then just month and day
    if (currentDate.getFullYear() === from.getFullYear()) {
      return formatDate(from, "MMM d");
    }
    // if different year, then the full date
    else {
      return formatDate(from, "MMM d, yyy");
    }
  }
}

export function formatNumber(n: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * Create a new username from Google user.
 * Replaces empty spaces for dashes and removes any char
 * which not a letter or a number or a dash.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
