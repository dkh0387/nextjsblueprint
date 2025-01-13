/**
 * Server actions for log-out.
 * Actually a pardon to a normal POST request, so we still need to validate data.
 */
"use server"

import {lucia, validateRequest} from "@/auth";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export async function logout() {
    const {session} = await validateRequest();

    if (!session) {
        throw new Error("Unauthorized");
    }
    await lucia.invalidateSession(session.id);

    // destroys the existing session cookie and create an empty one
    const sessionCookie = lucia.createBlankSessionCookie();

    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return redirect('/login');
}