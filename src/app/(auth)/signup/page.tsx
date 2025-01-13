import { Metadata } from "next";
import Image from "next/image";
import signupImage from "@/assets/signup-image.jpg";
import Link from "next/link";

/**
 * Server rendering page for sign-up.
 */
export const metadata: Metadata = {
  title: "Sign up",
};

export default function Page() {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold">Sign up</h1>
            <p className="text-muted-foreground">
              A <span className="italic">platform</span> to play with
            </p>
          </div>
          <div className="space-y-5">
            sign up form
            <Link href="/login" className="block text-center hover:underline">
              Already have an account? Log in
            </Link>
          </div>
        </div>
        {/*hide the image if the screen is too small*/}
        <Image
          src={signupImage}
          alt={""}
          className="hidden w-1/2 object-cover md:block"
        />
      </div>
    </main>
  );
}
