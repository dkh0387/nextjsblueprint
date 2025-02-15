import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "@/lib/prisma";
import { Lucia, Session, User } from "lucia";
import { cache } from "react";
import { cookies } from "next/headers";
import { Google } from "arctic";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production", // secure cookie only in production
    },
  },
  getUserAttributes(databaseUSerAttributes) {
    // we return a set of attributes defined below
    // any time we fetch a session we get these fields
    // we do not need to query the db to get infos to the currently logged-in user
    return {
      id: databaseUSerAttributes.id,
      username: databaseUSerAttributes.username,
      displayName: databaseUSerAttributes.displayName,
      avatarUrl: databaseUSerAttributes.avatarUrl,
      googleId: databaseUSerAttributes.googleId,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes; // we connect the user attributes model from below to the Lucia user attributes type returned after log-in
  }
}

interface DatabaseUserAttributes {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  googleId: string | null;
}

/**
 * Google OAuth ID client with credentials.
 * The callback URL is the same one being set in Google Cloud platform.
 */
export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`,
);

/**
 * Usecase: we may fetch user session multiple times in the app on different places.
 * This one wraps it up to the only one db request and shares the result with all the components.
 * In general, check if the user is already authenticated, if so, return user and session, otherwise return nothing.
 */
export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;

    if (!sessionId) {
      return { user: null, session: null };
    }

    const result = await lucia.validateSession(sessionId);

    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }

      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch {}
    return result;
  },
);
