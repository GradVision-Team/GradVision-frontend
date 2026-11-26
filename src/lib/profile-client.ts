"use client";

import { ApiRequestError } from "@/lib/api";
import { refreshSessionWithDedup } from "@/lib/auth/refresh-session-client";

export type SaveResult =
  /** The change was saved. */
  | { status: "saved" }
  /** Saving failed; show `message` to the user. */
  | { status: "error"; message: string }
  /** The session can't be refreshed; send the user to /login. */
  | { status: "signed-out" };

const GENERIC_ERROR = "Something went wrong. Please try again.";

function toMessage(error: unknown): string {
  return error instanceof ApiRequestError ? error.message : GENERIC_ERROR;
}

/**
 * Runs a save request. If the access token has expired (401), refreshes the
 * session once and retries. Same flow as `submitOnboarding` in the onboarding wizard.
 */
export async function saveWithRefresh(action: () => Promise<void>): Promise<SaveResult> {
  try {
    await action();
    return { status: "saved" };
  } catch (error) {
    if (!(error instanceof ApiRequestError) || error.status !== 401) {
      return { status: "error", message: toMessage(error) };
    }
  }

  const refresh = await refreshSessionWithDedup();
  if (refresh.status === "unauthorized") return { status: "signed-out" };
  if (refresh.status === "unavailable") return { status: "error", message: refresh.message };

  try {
    await action();
    return { status: "saved" };
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return { status: "signed-out" };
    }
    return { status: "error", message: toMessage(error) };
  }
}
