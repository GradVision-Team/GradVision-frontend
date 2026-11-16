import { LandingAuthButton } from "@/components/landing/landing-auth-button";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export default function Home() {
  return (
    <>
      <LandingNavbar />
      <main className="flex flex-1 flex-col items-center px-4 pt-20 pb-16 text-center text-[var(--blue)] sm:px-8 sm:pt-40">
        <h1 className="text-4xl leading-tight font-bold tracking-tight uppercase [font-family:inherit] sm:text-6xl lg:text-[80px]">
          <span className="sm:block">See where your </span>
          <span className="sm:block">academic path can go!</span>
        </h1>

        <p className="mt-10 max-w-[40rem] text-xl sm:mt-28 sm:text-3xl">
          Explore graduate programs, research, and organize your path to grad
          school.
        </p>

        <LandingAuthButton
          href="/signup"
          className="mt-10 h-12 px-5 text-lg sm:mt-20 sm:w-auto sm:text-2xl"
        >
          Get Started Here!
        </LandingAuthButton>
      </main>
    </>
  );
}
