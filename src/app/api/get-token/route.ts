import {validateRequest} from "@/auth";
import streamServerClient from "@/lib/stream";

/**
 * Endpoint to get a token to authenticate the user for Stream Chat SDK.
 * @constructor
 */
export async function GET() {
  try {
    const { user: loggedInUser } = await validateRequest();

    console.log("Calling get-token for user: ", loggedInUser?.id);

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    // the token is valid for 1h and revalidate automatically
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
    // there might be a delay between server and client
    const issuedAt = Math.floor(Date.now() / 1000) - 60;
    const token = streamServerClient.createToken(
      loggedInUser?.id,
      expirationTime,
      issuedAt,
    );
    return Response.json({ token });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
