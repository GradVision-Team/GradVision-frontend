import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ApplicationServiceError } from "@/components/application-service-error";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { RestoringSession } from "@/components/restoring-session";
import { getValidatedSession } from "@/lib/auth/session";
import { isOnboardingComplete } from "@/lib/onboarding";

export const metadata: Metadata = {
  title: "Onboarding",
  description:
    "Set up your GradVision profile to get personalized graduate program recommendations.",
};

export default async function OnboardingPage() {
  const session = await getValidatedSession();

  if (!session.ok && session.reason === "refreshable") {
    return (
      <main className="flex min-h-screen flex-1 flex-col">
        <RestoringSession />
      </main>
    );
  }

  if (!session.ok && session.reason === "unauthorized") {
    redirect("/login");
  }

  if (!session.ok && session.reason === "unavailable") {
    return (
      <main className="flex min-h-screen flex-1 flex-col">
        <ApplicationServiceError
          message={session.message}
          retryHref="/onboarding"
        />
      </main>
    );
  }

  if (!session.ok) {
    redirect("/login");
  }

  if (isOnboardingComplete(session.user)) {
    redirect("/dashboard");
  }

  return (
    <AuthPageShell tagline="Let's build your GradVision">
      <OnboardingWizard />
    </AuthPageShell>
  );
}
