import { cn } from "@/lib/utils";

type OnboardingNavProps = {
  showBack: boolean;
  isSubmitting: boolean;
  continueLabel: string;
  onBack: () => void;
};

export function OnboardingNav({
  showBack,
  isSubmitting,
  continueLabel,
  onBack,
}: OnboardingNavProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center",
        showBack ? "sm:justify-between" : "sm:justify-end",
      )}
    >
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className={cn(
            "h-12 w-full rounded-[12px] border border-[var(--blue)] bg-[var(--white)] px-6 text-base font-medium text-[var(--blue)] sm:w-auto",
            "transition-opacity hover:opacity-90",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue)]",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          Back
        </button>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-disabled={isSubmitting}
        className={cn(
          "h-12 w-full rounded-[12px] border border-[var(--blue)] bg-[var(--blue)] px-6 text-base font-medium text-[var(--white)] sm:w-auto sm:min-w-[12rem]",
          "transition-opacity hover:opacity-90",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue)]",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        {continueLabel}
      </button>
    </div>
  );
}
