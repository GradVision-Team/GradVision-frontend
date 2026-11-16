import Image from "next/image";
import Link from "next/link";

import { LandingAuthButton } from "@/components/landing/landing-auth-button";

export function LandingNavbar() {
  return (
    <header className="bg-[var(--gray)]">
      <nav
        aria-label="Main"
        className="flex h-11 items-center justify-end gap-4 px-4 sm:h-[69px] sm:justify-between sm:px-6"
      >
        <Link href="/" className="hidden items-center gap-3 sm:flex">
          <Image
            src="/gradvision-logo.svg"
            alt=""
            width={40}
            height={36}
            unoptimized
            className="h-9 w-auto shrink-0"
            aria-hidden
          />
          <span className="font-serif text-4xl leading-none font-bold text-[var(--blue)]">
            GradVision
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-10 sm:pr-8">
          <LandingAuthButton href="/login">Login</LandingAuthButton>
          <LandingAuthButton href="/signup">Get Started</LandingAuthButton>
        </div>
      </nav>
    </header>
  );
}
