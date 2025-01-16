import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { className } from "postcss-selector-parser";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  classname?: string;
}

export default function UserAvatar({
  avatarUrl,
  size,
  classname,
}: UserAvatarProps) {
  return (
    <Image
      src={avatarUrl || avatarPlaceholder}
      alt="User avatar"
      width={size ?? 48}
      height={size ?? 48}
      className={cn(
        "hf aspect-square flex-none rounded-full bg-secondary object-cover",
        className,
      )}
    />
  );
}
