"use client";

import {MessageCountInfo} from "@/lib/types";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Mail} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import kyInstance from "@/lib/ky";

/**
 * Button with unread count display for notifications.
 */
interface MessagesButtonProps {
    initialState: MessageCountInfo;
}

export default function MessagesButton(props: MessagesButtonProps) {
    const { data } = useQuery({
        queryKey: ["unread-message-count"],
        queryFn: () =>
            kyInstance
                .get("/api/messages/unread-count")
                .json<MessageCountInfo>(),
        initialData: props.initialState,
        // refetch data every minute
        refetchInterval: 60 * 1000,
    });
    return (
        <Button
            variant="ghost"
            className="flex items-center justify-start gap-3"
            title="Messages"
            asChild
        >
            <Link href="/messages">
                <div className="relative">
                    <Mail />
                    {/*-right-1: position further in the right as normal*/}
                    {!!data.unreadCount && (
                        <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-xs font-medium tabular-nums text-primary-foreground">
              {data.unreadCount}
            </span>
                    )}
                </div>
                <span className="hidden lg:inline">Messages</span>
            </Link>
        </Button>
    );
}
