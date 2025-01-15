import React from "react";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";

/**
 * We apply this wo both: login AND signup children,
 * because we do not want to validate user session any time by switching between them.
 * Doing so, we fetch a session only once.
 * @param children
 * @constructor
 */
export default async function Layout(children: React.ReactNode) {
  const { user } = await validateRequest();

  if (user) redirect("/");

  return <>{children}</>;
}
