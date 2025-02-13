/**
 * Server actions for sign-up.
 * Actually a pardon to a normal POST request, so we still need to validate data.
 */
"use server";

import { generateIdFromEntropySize } from "lucia";
import { signUpSchema, SingUpValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { prisma } from "@/lib/prisma";
import { lucia } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
import streamServerClient from "@/lib/stream";

export async function signUp(
  credentials: SingUpValues,
): Promise<{ error: string }> {
  try {
    const { username, email, password } = signUpSchema.parse(credentials);

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    const existingUserName = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive", // ignoring case sensitive
        },
      },
    });

    if (existingUserName) {
      return { error: "Username already exists" };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return { error: "Email already exists" };
    }

    // We want to run both, creating a new user and a new Streamer user for messaging in a transaction.
    // Problem: the second one is not a prisma operation, so we need another type of transaction
    // This one is called "Interactive transaction"
    // NOTE: only works if a foreign operation comes last
    // If the second one fails, the first will not be rolled back
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username: username,
          displayName: username,
          email: email,
          passwordHash: passwordHash,
        },
      });
      // Create a Streamer user for messaging
      await streamServerClient.upsertUser({
        id: userId,
        username: username,
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
    return redirect("/");
  } catch (error) {
    // if this special error occurs, we will not be redirected, so have to do it explicitly
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { error: "Something went wrong, please try again later." };
  }
}
