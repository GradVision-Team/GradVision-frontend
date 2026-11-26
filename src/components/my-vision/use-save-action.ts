"use client";

import { useRouter } from "next/navigation";

import { saveWithRefresh } from "@/lib/profile-client";

/**
 * Returns a `save(action)` function for the My Vision edit cards.
 *
 * It resolves to an error message to show, or null when the change was saved.
 * - Sample mode skips the network call entirely.
 * - An expired access token is refreshed and retried once (see `saveWithRefresh`).
 * - After a successful save the server page data is reloaded with `router.refresh()`.
 * - If the session can't be refreshed, the user is sent to /login.
 */
export function useSaveAction(isSample: boolean) {
  const router = useRouter();

  return async function save(action: () => Promise<void>): Promise<string | null> {
    if (isSample) return null;

    const result = await saveWithRefresh(action);
    if (result.status === "saved") {
      router.refresh();
      return null;
    }
    if (result.status === "signed-out") {
      router.replace("/login");
      return "Your session expired. Please sign in again.";
    }
    return result.message;
  };
}
