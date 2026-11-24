import type { BackendAuth } from "@/lib/auth/backend-request";
import type { Application } from "@/lib/dashboard";
import { DashboardLoadError, getList } from "@/lib/dashboard-server";

export class ProfileLoadError extends Error {
  constructor(public status?: number) {
    super("We couldn't load your profile. Please try again in a moment.");
    this.name = "ProfileLoadError";
  }
}

/** Loads the user's applications (each carries its `statement_url`). Server only. */
export async function fetchApplications(auth: BackendAuth): Promise<Application[]> {
  try {
    return await getList<Application>(auth, `/users/${auth.userId}/applications/`);
  } catch (error) {
    if (error instanceof DashboardLoadError) throw new ProfileLoadError(error.status);
    throw error;
  }
}
