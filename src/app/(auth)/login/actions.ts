/**
 * Server actions for log-in.
 * Actually a pardon to a normal POST request, so we still need to validate data.
 */
"use server"

import {logInSchema, LogInValues} from "@/lib/validation";
import {isRedirectError} from "next/dist/client/components/redirect";
import {prisma} from "@/lib/prisma";
import {verify} from "@node-rs/argon2";
import {lucia} from "@/auth";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export async function login(credentials: LogInValues): Promise<{ error: string }> {
    try {
        const {username, password} = logInSchema.parse(credentials);

        const existingUser = await prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive",
                }
            }
        });

        if (!existingUser || !existingUser.passwordHash) {
            return {error: "invalid credentials"};
        }

        const validPassword = await verify(existingUser.passwordHash, password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1
        });

        if (!validPassword) {
            return {error: "invalid credentials"};
        }
        const session = await lucia.createSession(existingUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        return redirect("/");
    } catch (error) {
        if (isRedirectError(error)) throw error;
        console.error(error);
        return {error: "Something went wrong, please try again."};
    }
}