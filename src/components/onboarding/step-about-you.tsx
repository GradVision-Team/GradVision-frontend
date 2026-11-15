import { AuthField } from "@/components/auth/auth-field";
import {
  getGraduationYearBounds,
  type OnboardingDraft,
} from "@/lib/onboarding";

type StepAboutYouProps = {
  draft: OnboardingDraft;
  errorId?: string;
  invalid?: boolean;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function StepAboutYou({
  draft,
  errorId,
  invalid,
  onChange,
}: StepAboutYouProps) {
  const { minYear, maxYear } = getGraduationYearBounds();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-bold sm:text-3xl">About You</h2>
        <p className="mt-2 text-base sm:text-lg">
          Tell us about your current academic path.
        </p>
      </div>

      <AuthField
        id="onboarding-university"
        label="Current university"
        name="universityName"
        type="text"
        autoComplete="organization"
        placeholder="San Diego State University"
        value={draft.universityName}
        onChange={(event) => onChange({ universityName: event.target.value })}
        aria-describedby={errorId}
        aria-invalid={invalid}
      />

      <AuthField
        id="onboarding-major"
        label="Current major"
        name="major"
        type="text"
        autoComplete="off"
        placeholder="Computer Engineering"
        value={draft.major}
        onChange={(event) => onChange({ major: event.target.value })}
        aria-describedby={errorId}
        aria-invalid={invalid}
      />

      <AuthField
        id="onboarding-graduation-year"
        label="Expected graduation year"
        name="expectedGraduationYear"
        type="number"
        inputMode="numeric"
        min={minYear}
        max={maxYear}
        placeholder={String(minYear + 1)}
        value={
          draft.expectedGraduationYear === null
            ? ""
            : String(draft.expectedGraduationYear)
        }
        onChange={(event) => {
          const raw = event.target.value.trim();
          if (!raw) {
            onChange({ expectedGraduationYear: null });
            return;
          }
          const year = Number.parseInt(raw, 10);
          onChange({
            expectedGraduationYear: Number.isNaN(year) ? null : year,
          });
        }}
        aria-describedby={errorId}
        aria-invalid={invalid}
      />
    </div>
  );
}
