import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LandingAuthButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/** Burgundy rounded link button used in the landing navbar. */
export function LandingAuthButton({
  href,
  children,
  className,
}: LandingAuthButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-7 items-center justify-center rounded-[12px] bg-[var(--burgundy)] px-4 text-xs whitespace-nowrap text-[var(--white)] transition-opacity hover:opacity-90 sm:h-10 sm:w-48 sm:text-sm",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
