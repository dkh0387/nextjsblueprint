import {StreamChat} from "stream-chat";

/**
 * Stream server client to connect via the Stream API.
 */
const streamServerClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_KEY!,
  process.env.STREAM_SECRET,
);

export default streamServerClient;
