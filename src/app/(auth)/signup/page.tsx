import { Metadata } from "next";
import Image from "next/image";
import signupImage from "@/assets/signup-image.jpg";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function Page() {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="md:w-1/2">login form</div>
        {/*hide the image if the screen is too small*/}
        <Image src={signupImage} alt={""} className="hidden w-1/2 md:block" />
      </div>
    </main>
  );
}
