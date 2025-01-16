import { children } from "effect/Fiber";
import Link from "next/link";
import UserButton from "@/components/UserButton";

export default function Navbar() {
  /*
                            sticky: if we scroll down, it stays at the top
                            top-0: placed at the top
                            z-10: the navbar shows above other elements and not below them
                            bg-card: background color, switches between light and dark mode
                            flex-wrap: if we have to many elements it automatically switches to a new line
                            px-5: horizontal padding of 5 px
                            py-3: vertical padding of 3 px
                            text-primary: primary color, defined in src/app/globals.css, is loaded
                            * */
  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-5 px-5 py-3">
        <Link href="/" className="text-2xl font-bold text-primary">
          Playground
        </Link>
        <UserButton></UserButton>
      </div>
    </header>
  );
}
