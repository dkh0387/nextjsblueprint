import {NextRequest} from "next/server";
import {cookies} from "next/headers";
import {google, lucia} from "@/auth";
import kyInstance from "@/lib/ky";
import {prisma} from "@/lib/prisma";
import {generateIdFromEntropySize} from "lucia";
import {slugify} from "@/lib/utils";
import streamServerClient from "@/lib/stream";
import {OAuth2RequestError} from "arctic";

/**
 * Callback to receive the state and code verifier after Google Sign in.
 * The state is being provided via search params.
 * Those params were sent to Google via [src/app/(auth)/login/google/route.ts].
 * @param req
 * @constructor
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  // get values back we store in the cookie while log-in to compare
  const storedState = cookies().get("state")?.value;
  const storedCodeVerifier = cookies().get("code_verifier")?.value;

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return new Response(null, { status: 400 });
  }

  // After authenticating Google user, we get a token back.
  // We then use this token to fetch the user information.
  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );
    const googleUser = await kyInstance
      .get("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      })
      .json<{ id: string; name: string }>();

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { googleId: googleUser.id },
    });

    // If so, log-in by creating a new session
    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
      return new Response(null, { status: 302, headers: { Location: "/" } });
    }

    // If the user does not exist, sign-up a new one
    const userId = generateIdFromEntropySize(10);
    const username = slugify(googleUser.name) + "-" + userId.slice(0, 4);

    // We want to run both, creating a new user and a new Streamer user for messaging in a transaction.
    // Problem: the second one is not a prisma operation, so we need another type of transaction
    // This one is called "Interactive transaction"
    // NOTE: only works if a foreign operation comes last
    // If the second one fails, the first will not be rolled back
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: googleUser.name,
          googleId: googleUser.id,
        },
      });
      // Create an according Streamer user for messaging
      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: username,
      });
    });

    // immediately log-in after successful signup
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return new Response(null, { status: 302, headers: { Location: "/" } });
  } catch (error) {
    console.log(error);

    if (error instanceof OAuth2RequestError) {
      return new Response(null, { status: 400 });
    }
    return new Response(null, { status: 500 });
  }
}


// http://localhost:3000/api/auth/callback/google
// http://localhost:3000/api/auth/callback/google
// ?state=TBj5tR96maGy_D6EJI9SfpU8MiWrt9hvCNSNKqI0lNo&code=4%2F0ASVgi3JQOpHpLWGDCR6qAEbRzvg8liaR6srAxLTYZpmXkzKNYzS28c5kjh8FkUVq38PsFQ
// &scope=email+profile+openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&authuser=3&prompt=consent