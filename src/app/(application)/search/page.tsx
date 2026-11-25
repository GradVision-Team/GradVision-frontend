import type { Metadata } from "next";

import { ApplicationPageHeader } from "@/components/application-page-header";
import { SearchPageContent } from "@/components/search/search-page-content";
import { renderProtectedApplicationPage } from "@/lib/auth/protected-page";

export const metadata: Metadata = {
  title: "Search",
  description: "Search graduate programs and universities.",
};

export default function SearchPage() {
  return renderProtectedApplicationPage("/search", () => (
    <main className="flex-1">
      <ApplicationPageHeader
        title="Search"
        description="Find graduate programs and universities."
      />

      <SearchPageContent />
    </main>
  ));
}