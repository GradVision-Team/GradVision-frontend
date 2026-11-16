/**
 * Onboarding survey draft, option lists, and backend mapping helpers.
 *
 * MVP field mappings (document in PR / share with backend):
 * - "What matters" multi-select → `career_goals`
 * - Free-text goals → `personal_statement`
 * - Degree path (single choice) → `program_interests: [value]`
 * - Areas of study → `research_interests`
 *
 * PastEducationCreate requires fields the wireframe does not collect.
 * Documented MVP defaults when mapping Step 1:
 * - degree: "Undergraduate"
 * - year_started: expectedGraduationYear - 4
 * - currently_attending: true
 */

export const ONBOARDING_STORAGE_KEY = "gradvision.onboarding.draft";

export const DEGREE_PATH_OPTIONS = ["Master's", "PhD", "Not sure"] as const;

export type DegreePathOption = (typeof DEGREE_PATH_OPTIONS)[number];

export const RESEARCH_INTEREST_OPTIONS = [
  "Computer Science",
  "Computer Engineering",
  "Electrical Engineering",
  "Data Science",
  "Biomedical Engineering",
  "Mechanical Engineering",
  "Other",
] as const;

export const WHAT_MATTERS_OPTIONS = [
  "Research opportunities",
  "Funding",
  "Location",
  "Career outcomes",
] as const;

export type OnboardingStep = 1 | 2 | 3;

export type OnboardingDraft = {
  universityName: string;
  major: string;
  expectedGraduationYear: number | null;
  researchInterests: string[];
  programInterest: DegreePathOption | null;
  careerGoals: string[];
  personalStatement: string;
};

export type OnboardingPersistedState = {
  step: OnboardingStep;
  draft: OnboardingDraft;
};

export type PastEducationPayload = {
  university_name: string;
  major: string;
  degree: string;
  year_started: number;
  year_ended: number;
  currently_attending: boolean;
};

/**
 * Payload for PATCH /api/users/{id} (UserUpdate).
 * See GradVision-backend schemas/users.py.
 */
export type OnboardingUserUpdatePayload = {
  past_education: PastEducationPayload[];
  research_interests: string[];
  program_interests: string[];
  career_goals: string[];
  personal_statement: string;
};

export function createEmptyOnboardingDraft(): OnboardingDraft {
  return {
    universityName: "",
    major: "",
    expectedGraduationYear: null,
    researchInterests: [],
    programInterest: null,
    careerGoals: [],
    personalStatement: "",
  };
}

export function getGraduationYearBounds(now = new Date()) {
  const currentYear = now.getFullYear();
  return {
    minYear: currentYear,
    maxYear: currentYear + 10,
  };
}

export function validateOnboardingStep(
  step: OnboardingStep,
  draft: OnboardingDraft,
): string | null {
  if (step === 1) {
    if (!draft.universityName.trim()) {
      return "Enter your current university.";
    }
    if (!draft.major.trim()) {
      return "Enter your current major.";
    }
    if (draft.expectedGraduationYear === null) {
      return "Enter your expected graduation year.";
    }
    const { minYear, maxYear } = getGraduationYearBounds();
    if (
      !Number.isInteger(draft.expectedGraduationYear) ||
      draft.expectedGraduationYear < minYear ||
      draft.expectedGraduationYear > maxYear
    ) {
      return `Enter a graduation year between ${minYear} and ${maxYear}.`;
    }
    return null;
  }

  if (step === 2) {
    if (draft.researchInterests.length === 0) {
      return "Select at least one area of study or interest.";
    }
    if (!draft.programInterest) {
      return "Select a degree path.";
    }
    return null;
  }

  if (draft.careerGoals.length === 0) {
    return "Select at least one thing that matters to you.";
  }
  if (!draft.personalStatement.trim()) {
    return "Describe your academic or career goals.";
  }
  return null;
}

/**
 * Maps the onboarding draft to a UserUpdate body.
 * PastEducation defaults are intentional MVP assumptions — see file header.
 */
export function mapDraftToUserUpdate(
  draft: OnboardingDraft,
): OnboardingUserUpdatePayload {
  if (draft.expectedGraduationYear === null || !draft.programInterest) {
    throw new Error("Onboarding draft is incomplete.");
  }

  const yearEnded = draft.expectedGraduationYear;

  return {
    past_education: [
      {
        university_name: draft.universityName.trim(),
        major: draft.major.trim(),
        // MVP default — wireframe does not collect degree
        degree: "Undergraduate",
        // MVP default — wireframe does not collect start year
        year_started: yearEnded - 4,
        year_ended: yearEnded,
        currently_attending: true,
      },
    ],
    research_interests: [...draft.researchInterests],
    program_interests: [draft.programInterest],
    career_goals: [...draft.careerGoals],
    personal_statement: draft.personalStatement.trim(),
  };
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

/** Profile fields used to decide whether onboarding already finished (MVP heuristic). */
export type OnboardingCompletionProfile = {
  past_education?: unknown;
  research_interests?: unknown;
  program_interests?: unknown;
  career_goals?: unknown;
  personal_statement?: string | null;
};

/**
 * MVP completion check until the backend adds `onboarding_complete`.
 * Normalizes missing/null arrays safely.
 */
export function isOnboardingComplete(
  user: OnboardingCompletionProfile,
): boolean {
  return (
    Array.isArray(user.past_education) &&
    user.past_education.length > 0 &&
    asStringArray(user.research_interests).length > 0 &&
    asStringArray(user.program_interests).length > 0 &&
    asStringArray(user.career_goals).length > 0 &&
    Boolean(user.personal_statement?.trim())
  );
}

export function isOnboardingStep(value: unknown): value is OnboardingStep {
  return value === 1 || value === 2 || value === 3;
}

export function parsePersistedOnboardingState(
  raw: string | null,
): OnboardingPersistedState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const step = "step" in parsed ? parsed.step : null;
    const draft = "draft" in parsed ? parsed.draft : null;
    if (!isOnboardingStep(step) || typeof draft !== "object" || draft === null) {
      return null;
    }

    const empty = createEmptyOnboardingDraft();
    const programInterest =
      "programInterest" in draft &&
      typeof draft.programInterest === "string" &&
      DEGREE_PATH_OPTIONS.includes(draft.programInterest as DegreePathOption)
        ? (draft.programInterest as DegreePathOption)
        : null;

    const expectedGraduationYear =
      "expectedGraduationYear" in draft &&
      typeof draft.expectedGraduationYear === "number" &&
      Number.isInteger(draft.expectedGraduationYear)
        ? draft.expectedGraduationYear
        : null;

    return {
      step,
      draft: {
        universityName:
          "universityName" in draft && typeof draft.universityName === "string"
            ? draft.universityName
            : empty.universityName,
        major:
          "major" in draft && typeof draft.major === "string"
            ? draft.major
            : empty.major,
        expectedGraduationYear,
        researchInterests: asStringArray(
          "researchInterests" in draft ? draft.researchInterests : [],
        ),
        programInterest,
        careerGoals: asStringArray(
          "careerGoals" in draft ? draft.careerGoals : [],
        ),
        personalStatement:
          "personalStatement" in draft &&
          typeof draft.personalStatement === "string"
            ? draft.personalStatement
            : empty.personalStatement,
      },
    };
  } catch {
    return null;
  }
}
