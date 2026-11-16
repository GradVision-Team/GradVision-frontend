import type { OnboardingStep } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["About You", "Your Interests", "Your Goals"] as const;
const TOTAL_STEPS = STEP_LABELS.length;

type OnboardingProgressProps = {
  step: OnboardingStep;
};

export function OnboardingProgress({ step }: OnboardingProgressProps) {
  const progressRatio = (step - 1) / (TOTAL_STEPS - 1);

  return (
    <nav aria-label="Onboarding progress" className="w-full">
      <p className="sr-only">
        Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
      </p>
      <div className="relative flex items-center">
        <div
          aria-hidden
          className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-[color-mix(in_srgb,var(--blue)_20%,var(--cream))]"
        />
        <div
          aria-hidden
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-[var(--blue)] transition-[width] duration-300 ease-out"
          style={{ width: `${progressRatio * 100}%` }}
        />
        <ol className="relative z-10 flex w-full items-center justify-between">
          {STEP_LABELS.map((label, index) => {
            const stepNumber = (index + 1) as OnboardingStep;
            const isCurrent = stepNumber === step;
            const isComplete = stepNumber < step;

            return (
              <li key={label}>
                <span
                  className={cn(
                    "block size-2.5 rounded-full transition-all duration-300",
                    isCurrent || isComplete
                      ? "bg-[var(--blue)]"
                      : "bg-[var(--cream)] ring-1 ring-[color-mix(in_srgb,var(--blue)_35%,var(--cream))]",
                    isCurrent && "scale-125",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-hidden
                />
                <span className="sr-only">{label}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
