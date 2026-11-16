import Image from "next/image";
import Link from "next/link";

import { LandingAuthButton } from "@/components/landing/landing-auth-button";

export function LandingNavbar() {
  return (
    <header className="bg-[var(--gray)]">
      <nav
        aria-label="Main"
        className="flex h-[69px] items-center justify-between gap-4 px-4 sm:px-6"
      >
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/gradvision-logo.svg"
            alt=""
            width={40}
            height={36}
            unoptimized
            className="h-7 w-auto shrink-0 sm:h-9"
            aria-hidden
          />
          <span className="font-serif text-2xl leading-none font-bold text-[var(--blue)] sm:text-4xl">
            GradVision
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-10 sm:pr-8">
          <LandingAuthButton href="/login">Login</LandingAuthButton>
          <LandingAuthButton href="/signup">Get Started</LandingAuthButton>
        </div>
      </nav>
    </header>
  );
}
