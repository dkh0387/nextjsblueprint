import {generateCodeVerifier, generateState} from "arctic";
import {google} from "@/auth";
import {cookies} from "next/headers";

/**
 * Redirecting to the Google server for OAuth after click on "Sign in with Google".
 */
export async function GET() {
  // We send this state to the Google server and get it back with data
  // Doing so we avoid security issues
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = await google.createAuthorizationURL(state, codeVerifier, {
    // the same scopes we selected in the Google Cloud console
    scopes: ["profile", "email"],
  });
  // cookie configuration to store the state
  cookies().set("state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });
  // cookie configuration to store the code verifier
  cookies().set("code_verifier", codeVerifier, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });
  // redirect to the created Google sing in url
  return Response.redirect(url);
}
