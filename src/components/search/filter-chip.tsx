"use client";

import { X } from "lucide-react";

type FilterChipProps = {
  label: string;
  onRemove: () => void;
};

export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="flex items-center gap-3 rounded-xl bg-[var(--burgundy)] px-1.5 py-1 text-1x.4 text-[var(--white)]"
    >
      {label}
      <X className="size-4" />
    </button>
  );
}