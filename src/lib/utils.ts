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
