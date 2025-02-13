import {useSession} from "@/app/(main)/SessionProvider";
import {useEffect, useState} from "react";
import {StreamChat} from "stream-chat";
import kyInstance from "@/lib/ky";

/**
 * Custom hook for the Stream Chat connection.
 * This one runs on the frontend, so we don't need the secret.
 */
export default function useInitializeChatClient() {
  const { loggedInUser } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);
    // user data, which are sending to Stream and creating the user in the dashboard
    client
      .connectUser(
        {
          id: loggedInUser.id,
          username: loggedInUser.username,
          name: loggedInUser.displayName,
          image: loggedInUser.avatarUrl,
        },
        async () =>
          kyInstance
            .get("/api/get-token")
            .json<{ token: string }>()
            // return just the token when promise succeeds
            .then((data) => data.token),
      )
      .catch((error) => console.error("Failed to connect user", error))
      //set the chat client after the user was connected
      .then(() => setChatClient(client));
    // clean up, every time when useEffects runs again or if the component is unmounted
    return () => {
      setChatClient(null);
      client
        .disconnectUser()
        .catch((error) => console.error("Failed to disconnect user", error))
        .then(() => console.log("Connection closed"));
    };
  }, [
    loggedInUser.id,
    loggedInUser.username,
    loggedInUser.displayName,
    loggedInUser.avatarUrl,
  ]);
  return chatClient;
}
