"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Heart } from "lucide-react";

import { FilterChip } from "@/components/search/filter-chip";
import {
  getSavedProgramIds,
  saveProgram,
  searchPrograms,
  unsaveProgram,
  type DegreeType,
  type SearchProgramResult,
} from "@/lib/api";

type ProgramResultCardProps = {
  result: SearchProgramResult;
  saved?: boolean;
  onSave?: (programId: number) => void;
};

const DEGREE_OPTIONS: {
  value: DegreeType;
  label: string;
}[] = [
  { value: "Masters", label: "Master's" },
  { value: "PhD", label: "PhD" },
  { value: "Combined", label: "Combined Degree" },
];

export function SearchPageContent() {
  const [query, setQuery] = useState("");
  const [degreeType, setDegreeType] = useState<DegreeType[]>([]);
  const [location, setLocation] = useState("San Diego");

  const [programs, setPrograms] = useState<SearchProgramResult[]>([]);
  const [savedProgramIds, setSavedProgramIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setPrograms([]);

    try {
      const results = await searchPrograms({
        search: query.trim() || undefined,
        location: location || undefined,
        degreeType:
          degreeType.length > 0 ? degreeType : undefined,
      });

      setPrograms(results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to search programs.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProgram(programId: number) {
  const isCurrentlySaved =
    savedProgramIds.includes(programId);

  try {
    if (isCurrentlySaved) {
      await unsaveProgram(programId);

      setSavedProgramIds((currentIds) =>
        currentIds.filter((id) => id !== programId),
      );
    } else {
      await saveProgram(programId);

      setSavedProgramIds((currentIds) => [
        ...currentIds,
        programId,
      ]);
    }
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to update saved program.",
    );
  }
}

  function removeDegreeType(degreeType: DegreeType) {
    setDegreeType((currentTypes) =>
      currentTypes.filter((type) => type !== degreeType),
    );
  }

  useEffect(() => {
  async function loadSavedPrograms() {
    try {
      const savedIds = await getSavedProgramIds();
      setSavedProgramIds(savedIds);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load saved programs.",
      );
    }
  }

    void loadSavedPrograms();
  }, []);
  return (
    <section className="space-y-6 p-6">
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap gap-3"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search programs or universities"
          className="min-w-[240px] flex-1 rounded border px-4 py-2"
        />

        <select
          value=""
          onChange={(event) => {
            const selectedDegree = event.target.value as DegreeType;

            if (
              selectedDegree &&
              !degreeType.includes(selectedDegree)
            ) {
              setDegreeType((currentTypes) => [
                ...currentTypes,
                selectedDegree,
              ]);
            }
          }}
          className="rounded border px-4 py-2"
        >
          <option value="">Add degree type</option>

          {DEGREE_OPTIONS.filter(
            (option) => !degreeType.includes(option.value),
          ).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[var(--blue)] px-5 py-2 text-white"
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </form>

      <div className="flex flex-wrap gap-4">
        {degreeType.map((degreeType) => {
          const option = DEGREE_OPTIONS.find(
            (item) => item.value === degreeType,
          );

          return (
            <FilterChip
              key={degreeType}
              label={option?.label ?? degreeType}
              onRemove={() => removeDegreeType(degreeType)}
            />
          );
        })}

        {location && (
          <FilterChip
            label={location}
            onRemove={() => setLocation("")}
          />
        )}
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && programs.length === 0 && (
        <p className="text-[var(--blue)]">
          Search for programs to see results.
        </p>
      )}

      <div className="space-y-4">
        {programs.map((program) => (
          <ProgramResultCard
            key={program.program_id}
            result={program}
            saved={savedProgramIds.includes(program.program_id)}
            onSave={handleSaveProgram}
          />
        ))}
      </div>
    </section>
  );
}

export function ProgramResultCard({
  result,
  saved = false,
  onSave,
}: ProgramResultCardProps) {
  const duration =
    result.program_start !== null &&
    result.program_end !== null
      ? result.program_end - result.program_start
      : null;

  return (
    <article className="relative min-h-[315px] border-l-4 border-[var(--gold)] bg-[#fff3c5] px-6 py-2">
      <button
        type="button"
        onClick={() => onSave?.(result.program_id)}
        aria-label={
          saved ? "Remove saved program" : "Save program"
        }
        className="absolute right-5 top-4 flex size-14 items-center justify-center rounded-full bg-[var(--burgundy)] text-[var(--white)] hover:opacity-90"
      >
        <Heart
          className="size-8"
          fill={saved ? "currentColor" : "none"}
          strokeWidth={2}
        />
      </button>

      <div className="pr-36">
        <h2 className="font-serif text-4xl leading-tight text-[var(--blue)]">
          {result.university.university_name}
        </h2>

        <p className="mt-1 text-3xl text-[var(--blue)]">
          <em>
            {result.university.location ??
              "Location unavailable"}
          </em>

          <span className="ml-8">
            {result.degree_type}
            {duration !== null ? ` - ${duration} Years` : ""}
          </span>
        </p>

        <p className="mt-2 text-xl text-[var(--blue)]">
          {result.program_name}
        </p>
      </div>

      <p className="absolute right-6 top-28 text-3xl text-[var(--blue)]">
        {result.match_score}% Match
      </p>

      <div className="mt-10 space-y-3">
        {result.professors.length === 0 && (
          <p className="text-xl text-[#637c9d]">
            No professors found.
          </p>
        )}

        {result.professors.slice(0, 3).map((professor) => (
          <div
            key={professor.professor_id}
            className="grid grid-cols-[220px_1fr] gap-6 text-xl"
          >
            <strong className="text-[var(--blue)]">
              {professor.name}
            </strong>

            <span className="text-[#637c9d]">
              Research:{" "}
              {professor.research_interests?.join(", ") ||
                "Research information unavailable"}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}