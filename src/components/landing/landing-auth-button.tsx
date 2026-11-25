import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LandingAuthButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  /** `solid` = burgundy fill (default); `outline` = burgundy border, transparent fill. */
  variant?: "solid" | "outline";
};

const variantClasses = {
  solid: "bg-[var(--burgundy)] text-[var(--white)] hover:opacity-90",
  outline:
    "border-2 border-[var(--burgundy)] bg-transparent text-[var(--burgundy)] hover:bg-[var(--cream)]",
} as const;

/** Burgundy rounded link button used in the landing navbar and hero. */
export function LandingAuthButton({
  href,
  children,
  className,
  variant = "solid",
}: LandingAuthButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-7 items-center justify-center rounded-[12px] px-4 text-xs whitespace-nowrap transition sm:h-10 sm:w-48 sm:text-sm",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue)]",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
