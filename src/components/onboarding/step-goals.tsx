import { authInputClassName } from "@/components/auth/auth-field";
import { OptionGroup } from "@/components/onboarding/option-group";
import {
  WHAT_MATTERS_OPTIONS,
  type OnboardingDraft,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";

type StepGoalsProps = {
  draft: OnboardingDraft;
  errorId?: string;
  invalid?: boolean;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function StepGoals({
  draft,
  errorId,
  invalid,
  onChange,
}: StepGoalsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-bold sm:text-3xl">Your Goals</h2>
        <p className="mt-2 text-base sm:text-lg">
          Share what matters most as you plan for graduate school.
        </p>
      </div>

      <OptionGroup
        type="checkbox"
        legendId="onboarding-what-matters"
        legend="What matters to you?"
        options={WHAT_MATTERS_OPTIONS}
        values={draft.careerGoals}
        onChange={(careerGoals) => onChange({ careerGoals })}
        describedBy={errorId}
        invalid={invalid}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="onboarding-personal-statement" className="text-base font-medium">
          Academic or career goals
        </label>
        <textarea
          id="onboarding-personal-statement"
          name="personalStatement"
          rows={5}
          required
          placeholder="I want to pursue graduate study so that…"
          value={draft.personalStatement}
          onChange={(event) =>
            onChange({ personalStatement: event.target.value })
          }
          aria-describedby={errorId}
          aria-invalid={invalid || undefined}
          className={cn(
            authInputClassName,
            "min-h-32 resize-y py-3 leading-relaxed",
          )}
        />
      </div>
    </div>
  );
}
