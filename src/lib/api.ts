export type RegisterUserPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

export type ApiErrorBody = {
  success: false;
  error: string;
};

export class ApiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl?.trim()) {
    throw new ApiRequestError(
      "API URL is not configured. Set NEXT_PUBLIC_API_URL in .env.local.",
    );
  }

  return baseUrl.replace(/\/$/, "");
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    value.success === false &&
    "error" in value &&
    typeof value.error === "string"
  );
}

export function getApiErrorMessage(
  data: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (isApiErrorBody(data) && data.error.trim()) {
    return data.error;
  }

  return fallback;
}

export type LoginPayload = {
  email: string;
  password: string;
};

export async function loginUser(payload: LoginPayload): Promise<void> {
  let response: Response;

  try {
    response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ApiRequestError(
      "Unable to reach the server. Check your connection and try again.",
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    if (response.ok) {
      return;
    }

    throw new ApiRequestError("Something went wrong. Please try again.");
  }

  if (
    response.ok &&
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    data.success === true
  ) {
    return;
  }

  throw new ApiRequestError(getApiErrorMessage(data));
}

export async function logoutUser(): Promise<void> {
  let response: Response;

  try {
    response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    throw new ApiRequestError(
      "Unable to sign out. Check your connection and try again.",
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    if (response.ok) {
      return;
    }

    throw new ApiRequestError("Unable to sign out. Please try again.");
  }

  if (
    response.ok &&
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    data.success === true
  ) {
    return;
  }

  throw new ApiRequestError(getApiErrorMessage(data, "Unable to sign out. Please try again."));
}

export async function registerUser(payload: RegisterUserPayload): Promise<void> {
  const url = `${getApiBaseUrl()}/users`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ApiRequestError(
      "Unable to reach the server. Check your connection and try again.",
    );
  }

  if (response.status === 201) {
    return;
  }

  let message = "Something went wrong. Please try again.";

  try {
    const data: unknown = await response.json();
    message = getApiErrorMessage(data, message);
  } catch {
    // Non-JSON or empty body — keep generic message.
  }

  throw new ApiRequestError(message);
}

export type UniversitySummary = {
  university_id: number;
  university_name: string;
  location: string | null;
  program_count: number;
  professor_count: number;
};

export type Professor = {
  professor_id: number;
  name: string;
  department: string | null;
  university_id: number;
  research_interests: string[];
};

export type Paper = {
  paper_id: number;
  title: string;
  authors: string[];
  professor_ids: number[];
  topics: string[];
  abstract: string | null;
  publication_date: string | null;
  external_id_openalex: string | null;
  link: string | null;
};

export async function searchUniversities(filters: {
  search?: string;
  location?: string;
  programFields?: string[];
}): Promise<UniversitySummary[]> {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.location) {
    params.set("location", filters.location);
  }

  for (const field of filters.programFields ?? []) {
    params.append("program_fields", field);
  }

  params.set("limit", "50");
  params.set("offset", "0");

  const response = await fetch(
    `${getApiBaseUrl()}/search/universities?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new ApiRequestError("Unable to search universities.");
  }

  return response.json();
}

export async function getProfessors(
  universityId: number,
): Promise<Professor[]> {
  const response = await fetch(
    `${getApiBaseUrl()}/search/professors?university_id=${universityId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new ApiRequestError("Unable to load professors.");
  }

  return response.json();
}

export async function getProfessorPapers(
  professorId: number,
): Promise<Paper[]> {
  const response = await fetch(
    `${getApiBaseUrl()}/professors/${professorId}/papers`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new ApiRequestError("Unable to load papers.");
  }

  return response.json();
}

export type SearchProgramResult = {
  program_id: number;
  program_name: string;
  degree_type: string;
  field: string | null;
  price: number | null;
  funding_available: boolean;
  program_start: number | null;
  program_end: number | null;
  match_score: number;
  next_deadline: string | null;
  university: {
    university_id: number;
    university_name: string;
    location: string | null;
  };
  professors: Professor[];
};

export type DegreeType =
  | "Masters"
  | "PhD"
  | "Combined";

export async function searchPrograms(filters: {
  search?: string;
  location?: string[];
  degreeType?: DegreeType[];
}): Promise<SearchProgramResult[]> {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  for (const location of filters.location ?? []) {
    params.append("location", location);
  }

  for (const degreeType of filters.degreeType ?? []) {
    params.append("degree_type", degreeType);
  }

  const response = await fetch(
    `${getApiBaseUrl()}/search/programs?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new ApiRequestError(
      "Unable to search programs.",
    );
  }

  return response.json();
}

type SavedProgramSummary = {
  program_id: number;
};

export async function getSavedProgramIds(): Promise<number[]> {
  const response = await fetch("/api/saved-programs", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiRequestError(
      "Unable to load saved programs.",
    );
  }

  const programs =
    (await response.json()) as SavedProgramSummary[];

  return programs.map((program) => program.program_id);
}

export async function saveProgram(
  programId: number,
): Promise<void> {
  const response = await fetch("/api/saved-programs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      program_id: programId,
    }),
  });

  if (!response.ok) {
    throw new ApiRequestError("Unable to save program.");
  }
}

export async function unsaveProgram(
  programId: number,
): Promise<void> {
  const response = await fetch(
    `/api/saved-programs/${programId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new ApiRequestError(
      "Unable to remove saved program.",
    );
  }
}