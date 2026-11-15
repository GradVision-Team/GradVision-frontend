import { OptionGroup } from "@/components/onboarding/option-group";
import {
  DEGREE_PATH_OPTIONS,
  RESEARCH_INTEREST_OPTIONS,
  type DegreePathOption,
  type OnboardingDraft,
} from "@/lib/onboarding";

type StepInterestsProps = {
  draft: OnboardingDraft;
  errorId?: string;
  invalid?: boolean;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function StepInterests({
  draft,
  errorId,
  invalid,
  onChange,
}: StepInterestsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-bold sm:text-3xl">
          Your Interests
        </h2>
        <p className="mt-2 text-base sm:text-lg">
          Choose the areas and degree paths you are considering.
        </p>
      </div>

      <OptionGroup
        type="checkbox"
        legendId="onboarding-research-interests"
        legend="Areas of study or interests"
        options={RESEARCH_INTEREST_OPTIONS}
        values={draft.researchInterests}
        onChange={(researchInterests) => onChange({ researchInterests })}
        describedBy={errorId}
        invalid={invalid}
      />

      <OptionGroup
        type="radio"
        name="programInterest"
        legendId="onboarding-degree-path"
        legend="Degree path"
        options={DEGREE_PATH_OPTIONS}
        value={draft.programInterest}
        onChange={(value) =>
          onChange({ programInterest: value as DegreePathOption })
        }
        describedBy={errorId}
        invalid={invalid}
      />
    </div>
  );
}
