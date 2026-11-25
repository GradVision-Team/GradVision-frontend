import type { ProfileUpdatePayload } from "@/lib/profile";

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
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

/** Local FastAPI default (used when NEXT_PUBLIC_API_URL is unset in development). */
const DEFAULT_DEV_API_URL = "http://localhost:8000/api";

/** Production FastAPI default (used when NEXT_PUBLIC_API_URL is unset in production). */
const DEFAULT_PROD_API_URL = "https://gradvision-backend.onrender.com/api";

/**
 * Server-side FastAPI base URL (must end with `/api`).
 *
 * Browser calls stay same-origin (`/api/...` BFF routes) so httpOnly cookies work.
 * Those BFF handlers call this URL to reach the real backend.
 */
export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  const fallback =
    process.env.NODE_ENV === "production"
      ? DEFAULT_PROD_API_URL
      : DEFAULT_DEV_API_URL;
  const baseUrl = configured || fallback;

  return normalizeApiBaseUrl(baseUrl);
}

/** Strip trailing slashes and ensure the `/api` mount segment is present once. */
function normalizeApiBaseUrl(url: string): string {
  const normalized = url.replace(/\/+$/, "");

  if (normalized.endsWith("/api")) {
    return normalized;
  }

  return `${normalized}/api`;
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
  let response: Response;

  try {
    response = await fetch("/api/users", {
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

  throw new ApiRequestError(message, response.status);
}

/**
 * Updates the authenticated user's profile via the Next.js BFF.
 * Backend: PATCH /api/users/{id} (Bearer access token from httpOnly cookie).
 * The backend applies partial updates, so only the fields you send change.
 */
export function updateCurrentUserProfile(payload: ProfileUpdatePayload): Promise<void> {
  return sendJsonPatch("/api/users/me", payload);
}

/**
 * Sets (or clears, with null) the statement link on one application via the BFF.
 * Backend: PATCH /api/applications/{id}.
 */
export function updateApplicationStatementUrl(
  applicationId: number,
  statementUrl: string | null,
): Promise<void> {
  return sendJsonPatch(`/api/applications/${applicationId}`, {
    statement_url: statementUrl,
  });
}

async function sendJsonPatch(url: string, payload: unknown): Promise<void> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: "PATCH",
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

    throw new ApiRequestError(
      "Something went wrong. Please try again.",
      response.status,
    );
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

  throw new ApiRequestError(getApiErrorMessage(data), response.status);
}
