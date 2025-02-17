"use client";

import {Session, User} from "lucia";
import React, {createContext, useContext} from "react";

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

/**
 * Custom hook dealing with the fact, that the session context is initially null.
 * Advantage: we only have the null check here and return a non-nullable context.
 * So the value being provided always goes through this hook and is checked.
 */
export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("UseSession must used within a SessionProvider");
  }
  return context;
}
