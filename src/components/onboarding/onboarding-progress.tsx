import type { OnboardingStep } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["About You", "Your Interests", "Your Goals"] as const;

type OnboardingProgressProps = {
  step: OnboardingStep;
};

export function OnboardingProgress({ step }: OnboardingProgressProps) {
  return (
    <nav aria-label="Onboarding progress" className="w-full">
      <p className="mb-3 text-sm font-medium sm:text-base">
        Step {step} of 3 — {STEP_LABELS[step - 1]}
      </p>
      <ol className="flex gap-2">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = (index + 1) as OnboardingStep;
          const isCurrent = stepNumber === step;
          const isComplete = stepNumber < step;

          return (
            <li key={label} className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span
                className={cn(
                  "h-2 rounded-full",
                  isCurrent || isComplete
                    ? "bg-[var(--blue)]"
                    : "bg-[color-mix(in_srgb,var(--blue)_20%,var(--cream))]",
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "truncate text-xs sm:text-sm",
                  isCurrent ? "font-medium" : "opacity-70",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
