"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserButtonProps {
  className?: string;
}

/**
 * NOTE: usage of the custom hook [SessionProvider#useSession].
 * This one is throwing an error if you do not have an active user session.
 * So, if we remove the session context provider tag around the component in `(main)/layout.tsx`,
 * then an error should occur.
 * @param className
 * @constructor
 */
export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="">
          {/*TODO: user avatar component coming inside...*/}
        </button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}
