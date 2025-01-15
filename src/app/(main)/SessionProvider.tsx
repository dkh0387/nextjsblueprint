"use client";

import { Session, User } from "lucia";
import React, { createContext } from "react";

/**
 * Context provider for session.
 * It basically provides user session to all the child clients.
 * Here user and session cannot be null, because within the app we are logged in and those values are defined.
 */
interface SessionContext {
  user: User;
  session: Session;
}

const SessionContext = createContext<SessionContext | null>(null);

/**
 * We do pass the session fetched over [Layout] as value to all the child clients below.
 *
 * @param children
 * @param value
 * @constructor
 */
export default function SessionProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: SessionContext }>) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
