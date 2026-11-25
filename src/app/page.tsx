import Image from "next/image";

import { FeatureSection } from "@/components/landing/feature-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LandingAuthButton } from "@/components/landing/landing-auth-button";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { inter, lora } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    // Inter (body) / Lora (headings) for the whole landing page, matching the app.
    <div
      className={cn(
        lora.variable,
        inter.variable,
        "flex flex-1 flex-col font-[family-name:var(--font-inter)]",
      )}
    >
      <LandingNavbar />
      <main className="flex flex-1 flex-col items-center text-center text-[var(--blue)]">
        <section className="flex w-full flex-col items-center px-4 pt-16 pb-20 sm:px-8 sm:pt-40 sm:pb-32">
          {/* Mobile-only brand block; on larger screens the brand lives in the navbar. */}
          <div className="mb-12 flex items-center justify-center gap-3 sm:hidden">
            <Image
              src="/gradvision-logo.svg"
              alt=""
              width={44}
              height={40}
              unoptimized
              className="h-10 w-auto shrink-0"
              aria-hidden
            />
            {/* keeping the serif format for the gradvision header */}
            <p className="font-serif text-[40px] leading-none font-bold">
              GradVision
            </p>
          </div>

          <h1 className="text-4xl leading-tight font-bold tracking-tight uppercase font-[family-name:var(--font-lora)] sm:text-6xl lg:text-[80px]">
            <span className="sm:block">See where your </span>
            <span className="sm:block">academic path can go!</span>
          </h1>

          <p className="mt-10 max-w-[40rem] text-xl sm:mt-28 sm:text-3xl">
            Explore graduate programs, research, and organize your path to grad
            school.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:mt-20 sm:flex-row sm:gap-8">
            <LandingAuthButton
              href="/signup"
              className="h-12 px-5 text-lg sm:h-12 sm:w-auto sm:min-w-56 sm:text-2xl"
            >
              Get Started Here!
            </LandingAuthButton>
            {/* /explore is protected for now; logged-out visitors get redirected to login. */}
            <LandingAuthButton
              href="/explore"
              variant="outline"
              className="h-12 px-5 text-lg sm:h-12 sm:w-auto sm:min-w-56 sm:text-2xl"
            >
              Explore
            </LandingAuthButton>
          </div>
        </section>

        <FeatureSection />
        <HowItWorksSection />
      </main>
    </div>
  );
}
