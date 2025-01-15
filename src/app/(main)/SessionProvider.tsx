"use client";

import { Session, User } from "lucia";
import { createContext } from "node:vm";
import React from "react";

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

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {}
