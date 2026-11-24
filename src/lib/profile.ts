// My Vision types and helpers. Safe to import from client and server code.
// Types match the backend schemas (app/schemas/users.py, past_education.py).

import type { Application } from "@/lib/dashboard";
import { asStringArray, type PastEducationPayload } from "@/lib/onboarding";

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

/** One past_education entry as the backend expects it (PastEducationCreate). */
export type EducationPayload = Omit<PastEducationPayload, "major"> & {
  major: string | null;
};

/** Body for PATCH /api/users/me (UserUpdate). Every field is optional. */
export type ProfileUpdatePayload = Partial<{
  first_name: string;
  last_name: string;
  /** Replaces the whole list on the backend, so always send every entry. */
  past_education: EducationPayload[];
  research_interests: string[];
  program_interests: string[];
  career_goals: string[];
  personal_statement: string | null;
}>;

export type MyVisionProfile = {
  firstName: string;
  lastName: string;
  education: EducationPayload[];
  researchInterests: string[];
  programInterests: string[];
  /** One entry per line of `personal_statement` (the onboarding "goals" text). */
  goals: string[];
};

/** Fields of the user object (GET /users/{id}) that My Vision reads. */
type ProfileSource = {
  first_name: string;
  last_name: string;
  past_education?: unknown;
  research_interests?: unknown;
  program_interests?: unknown;
  personal_statement?: string | null;
};

function parseEducation(value: unknown): EducationPayload[] {
  if (!Array.isArray(value)) return [];

  const entries: EducationPayload[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const entry = item as Record<string, unknown>;
    if (typeof entry.university_name !== "string") continue;

    const yearEnded =
      typeof entry.year_ended === "number" ? entry.year_ended : new Date().getFullYear();
    entries.push({
      university_name: entry.university_name,
      major: typeof entry.major === "string" ? entry.major : null,
      degree: typeof entry.degree === "string" ? entry.degree : "Undergraduate",
      year_started: typeof entry.year_started === "number" ? entry.year_started : yearEnded - 4,
      year_ended: yearEnded,
      currently_attending:
        typeof entry.currently_attending === "boolean" ? entry.currently_attending : true,
    });
  }
  return entries;
}

export function normalizeProfile(user: ProfileSource): MyVisionProfile {
  return {
    firstName: user.first_name,
    lastName: user.last_name,
    education: parseEducation(user.past_education),
    researchInterests: asStringArray(user.research_interests),
    programInterests: asStringArray(user.program_interests),
    goals: goalsFromString(user.personal_statement),
  };
}

/** Index of the education entry to show: the one being attended now, else the last one. */
export function primaryEducationIndex(education: EducationPayload[]): number {
  const current = education.findIndex((entry) => entry.currently_attending);
  return current === -1 ? education.length - 1 : current;
}

/** "Computer Science • SDSU", or whichever parts are available. */
export function formatEducationLine(education: EducationPayload[]): string {
  const entry = education[primaryEducationIndex(education)];
  if (!entry) return "";
  return [entry.major?.trim(), entry.university_name.trim()].filter(Boolean).join(" • ");
}

/**
 * Returns the full past_education list with the primary entry's school and major changed.
 * If there is no entry yet, creates one with the same MVP defaults onboarding uses.
 */
export function withPrimaryEducation(
  education: EducationPayload[],
  patch: { university_name: string; major: string },
  now = new Date(),
): EducationPayload[] {
  const index = primaryEducationIndex(education);
  const major = patch.major.trim() || null;
  const universityName = patch.university_name.trim();

  if (index === -1) {
    const year = now.getFullYear();
    return [
      {
        university_name: universityName,
        major,
        degree: "Undergraduate",
        year_started: year - 4,
        year_ended: year,
        currently_attending: true,
      },
    ];
  }

  return education.map((entry, i) =>
    i === index ? { ...entry, university_name: universityName, major } : entry,
  );
}

// ---------------------------------------------------------------------------
// Goals (stored as the single `personal_statement` string, one goal per line)
// ---------------------------------------------------------------------------

/** Leading bullet characters people type by hand ("- ", "• ", "* "). */
const BULLET_PREFIX = /^\s*[-•*]\s+/;

export function goalsFromString(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(BULLET_PREFIX, "").trim())
    .filter(Boolean);
}

export function goalsToString(goals: string[]): string {
  return goals.join("\n");
}

// ---------------------------------------------------------------------------
// Personal statement links (stored on each application as `statement_url`)
// ---------------------------------------------------------------------------

export const MAX_STATEMENT_URL_LENGTH = 2048;

/**
 * Returns the trimmed URL if it is a valid http(s) link, otherwise null.
 * The value ends up in an href, so anything but http/https (javascript:, data:, ...)
 * must be rejected. Mirrors the backend rule.
 */
export function normalizeStatementUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_STATEMENT_URL_LENGTH) return null;

  try {
    const url = new URL(trimmed);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname) {
      return null;
    }
  } catch {
    return null;
  }
  return trimmed;
}

export function isValidStatementUrl(value: string): boolean {
  return normalizeStatementUrl(value) !== null;
}

export const STATEMENT_URL_ERROR = "Enter a full link starting with http:// or https://";

export function statementTitle(application: Pick<Application, "university_name">): string {
  return `Statement of Purpose - ${application.university_name}`;
}

// ---------------------------------------------------------------------------
// Sample data (from the wireframe) so the page can be shown without the backend
// ---------------------------------------------------------------------------

export const SAMPLE_PROFILE: MyVisionProfile = {
  firstName: "Adalina",
  lastName: "Martinez",
  education: [
    {
      university_name: "SDSU",
      major: "Computer Science",
      degree: "Undergraduate",
      year_started: 2023,
      year_ended: 2027,
      currently_attending: true,
    },
  ],
  researchInterests: [
    "Machine Learning",
    "Human-Computer Interaction",
    "Computer Vision",
    "Data Science",
    "Robotics",
  ],
  programInterests: ["M.S.", "M.B.A"],
  goals: [
    "Prepare for M.S. applications in technology",
    "Get guidance from current masters students",
    "Learn about U.S. programs",
  ],
};
