import React from "react";
import {validateRequest} from "@/auth";
import {redirect} from "next/navigation";
import SessionProvider from "./SessionProvider";
import Navbar from "@/app/(main)/Navbar";
import MenuBar from "@/app/(main)/MenuBar";

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
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  // if the session is undefined, we redirect to log in,
  // so we may allow session to be not nullable within the session provider
  if (!session.user) redirect("/login");

  return (
    <SessionProvider value={session}>
      {/*min-h-screen means as high as the current screen; flex-col places elements under each other*/}
      <div className="flex min-h-screen flex-col">
        <Navbar></Navbar>
        {/*max-width: 80rem or 1280 px; centered */}
        <div className=",max-w-7xl mx-auto flex w-full grow gap-5 p-5">
          {/*lg:<...>: behavior on a large screen
             xl: .... on a very big screen
          */}
          <MenuBar className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-80"></MenuBar>
          {children}
        </div>
        {/*second menu bar to show on the bottom in case of a mobile view */}
        <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden"></MenuBar>
      </div>
    </SessionProvider>
  );
}
