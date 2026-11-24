import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ApplicationServiceError } from "@/components/application-service-error";
import { muted } from "@/components/dashboard/dashboard-ui";

// components for the page
import { GoalsCard } from "@/components/my-vision/goals-card";
import { IdentityCard } from "@/components/my-vision/identity-card";
import { StatementsCard } from "@/components/my-vision/statements-card";
import { TagListCard } from "@/components/my-vision/tag-list-card";
import { getBackendAuth } from "@/lib/auth/backend-request";

// authentication and data structs
import { renderProtectedApplicationPage } from "@/lib/auth/protected-page";
import { SAMPLE_DASHBOARD_DATA, type Application } from "@/lib/dashboard";
import { inter, lora } from "@/lib/fonts";
import { DEGREE_PATH_OPTIONS, RESEARCH_INTEREST_OPTIONS } from "@/lib/onboarding";

// profile helpers
import {
  SAMPLE_PROFILE,
  normalizeProfile,
  type MyVisionProfile,
} from "@/lib/profile";
// fetch applications from backend for statement urls
import { ProfileLoadError, fetchApplications } from "@/lib/profile-server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Vision",
  description:
    "Review your interests and goals, and link your personal statements to your applications.",
};

// Set NEXT_PUBLIC_USE_SAMPLE_DATA=true in .env.local to preview the page
// with sample data, without logging in or running the backend.
const USE_SAMPLE_DATA = process.env.NEXT_PUBLIC_USE_SAMPLE_DATA === "true";

function MyVisionView({
  profile,
  applications,
  isSample,
}: {
  profile: MyVisionProfile;
  applications: Application[];
  isSample: boolean;
}) {
  return (
    <main
      className={cn(
        lora.variable,
        inter.variable,
        "flex-1 font-[family-name:var(--font-inter)] text-[var(--blue)]",
      )}
    >
      <header className="border-b border-[#a9bac3] bg-[#fffcf4] px-4 py-8 md:px-8">
        <h1 className="text-[31px] leading-tight font-normal">My Vision</h1>
        <p className={cn("mt-2 text-sm", muted)}>Your academic direction.</p>
      </header>

      <div className="flex flex-col gap-4 px-4 py-6 md:px-8">
        {isSample && (
          <p className="rounded-lg bg-[var(--gold)]/25 px-4 py-2 text-sm">
            Showing sample data (NEXT_PUBLIC_USE_SAMPLE_DATA is on). Changes aren&rsquo;t saved.
          </p>
        )}

        <IdentityCard
          initial={{
            firstName: profile.firstName,
            lastName: profile.lastName,
            education: profile.education,
          }}
          isSample={isSample}
        />

        <TagListCard
          title="Research Interests"
          editLabel="research interests"
          field="research_interests"
          initialValues={profile.researchInterests}
          presetOptions={RESEARCH_INTEREST_OPTIONS}
          isSample={isSample}
        />

        <TagListCard
          title="Program Interests"
          editLabel="program interests"
          field="program_interests"
          initialValues={profile.programInterests}
          presetOptions={DEGREE_PATH_OPTIONS}
          isSample={isSample}
        />

        <GoalsCard initialGoals={profile.goals} isSample={isSample} />

        <StatementsCard applications={applications} isSample={isSample} />
      </div>
    </main>
  );
}

export default async function MyVisionPage() {
  if (USE_SAMPLE_DATA) {
    return (
      <MyVisionView
        profile={SAMPLE_PROFILE}
        applications={SAMPLE_DASHBOARD_DATA.applications}
        isSample
      />
    );
  }

  return renderProtectedApplicationPage("/my-vision", async (user) => {
    // ensure we are authenticated
    const auth = await getBackendAuth();
    if (!auth) redirect("/login");

    // ensure we have the application data to be able to render the statements card 
    try {
      const applications = await fetchApplications(auth);
      return (
        <MyVisionView
          profile={normalizeProfile(user)}
          applications={applications}
          isSample={false}
        />
      );
    } catch (error) {
      if (error instanceof ProfileLoadError && error.status === 401) {
        redirect("/login");
      }
      return (
        <main className="flex-1">
          <ApplicationServiceError
            message="We couldn't load My Vision. Please try again in a moment."
            retryHref="/my-vision"
          />
        </main>
      );
    }
  });
}
