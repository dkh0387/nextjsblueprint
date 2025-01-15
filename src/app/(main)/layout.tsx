import React from "react";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Proof whether there is an active session, so a logged-in user.
 * If not, redirect for log-in.
 * Calling validateSession() serversides multiple times is fine, since we cache it,
 * but similar calls clientsides. like here are not being cached and could cause performance issues.
 * So we use this common layout to provide the call result to all the children,
 * avoiding their own calls.
 * We need to put the fetched session into a context provider to provide it to all the child client components.
 * @param children
 * @constructor
 */
export default async function Layout(children: React.ReactNode) {
  const session = await validateRequest();

  if (!session.user) redirect("/login");

  return <>{children}</>;
}
