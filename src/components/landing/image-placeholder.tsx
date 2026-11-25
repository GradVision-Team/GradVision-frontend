import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ImagePlaceholderProps = {
  className?: string;
};

/** Gray stand-in for marketing images. Swap for `next/image` once real assets exist. */
export function ImagePlaceholder({ className }: ImagePlaceholderProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-[var(--gray)] text-[var(--blue)]/40",
        className,
      )}
    >
      <ImageIcon className="size-12" strokeWidth={2} />
    </div>
  );
}
