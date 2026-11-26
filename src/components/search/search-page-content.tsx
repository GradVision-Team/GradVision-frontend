"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Heart, Search } from "lucide-react";

import { FilterChip } from "@/components/search/filter-chip";
import {
  getProfessorPapers,
  getSavedProgramIds,
  saveProgram,
  searchPrograms,
  unsaveProgram,
  type DegreeType,
  type Paper,
  type SearchProgramResult,
} from "@/lib/api";

type ProgramResultCardProps = {
  result: SearchProgramResult;
  saved?: boolean;
  onSave?: (programId: number) => void | Promise<void>;

  expandedProfessorId: number | null;
  papersByProfessor: Record<number, Paper[]>;
  loadingProfessorId: number | null;
  onProfessorClick: (professorId: number) => void;
};

const DEGREE_OPTIONS: {
  value: DegreeType;
  label: string;
}[] = [
  { value: "Masters", label: "Master's" },
  { value: "PhD", label: "PhD" },
  { value: "Combined", label: "Combined Degree" },
];

const LOCATION_OPTIONS = [
  "San Diego",
  "Los Angeles",
  "San Francisco",
];

export function SearchPageContent() {
  const [query, setQuery] = useState("");

  const [degreeType, setDegreeType] = useState<
    DegreeType[]
  >([]);

  const [location, setLocation] = useState<string[]>([]);

  const [programs, setPrograms] = useState<
    SearchProgramResult[]
  >([]);

  const [savedProgramIds, setSavedProgramIds] = useState<
    number[]
  >([]);

  const [expandedProfessorId, setExpandedProfessorId] =
    useState<number | null>(null);

  const [papersByProfessor, setPapersByProfessor] =
    useState<Record<number, Paper[]>>({});

  const [loadingProfessorId, setLoadingProfessorId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function runSearch(
    nextDegreeTypes = degreeType,
    nextLocations = location,
  ) {
    setLoading(true);
    setError(null);

    try {
      const results = await searchPrograms({
        search: query.trim() || undefined,
        location:
          nextLocations.length > 0
            ? nextLocations
            : undefined,
        degreeType:
          nextDegreeTypes.length > 0
            ? nextDegreeTypes
            : undefined,
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

  async function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    await runSearch();
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

  async function handleProfessorClick(
    professorId: number,
  ) {
    if (expandedProfessorId === professorId) {
      setExpandedProfessorId(null);
      return;
    }

    setExpandedProfessorId(professorId);
    setError(null);

    if (papersByProfessor[professorId]) {
      return;
    }

    setLoadingProfessorId(professorId);

    try {
      const professorPapers =
        await getProfessorPapers(professorId);

      setPapersByProfessor((currentPapers) => ({
        ...currentPapers,
        [professorId]: professorPapers,
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load professor papers.",
      );
    } finally {
      setLoadingProfessorId(null);
    }
  }

  function toggleDegreeType(degree: DegreeType) {
    const nextDegreeTypes = degreeType.includes(degree)
      ? degreeType.filter(
          (currentDegree) => currentDegree !== degree,
        )
      : [...degreeType, degree];

    setDegreeType(nextDegreeTypes);

    void runSearch(nextDegreeTypes, location);
  }

  function toggleLocation(locationValue: string) {
    const nextLocations = location.includes(locationValue)
      ? location.filter(
          (currentLocation) =>
            currentLocation !== locationValue,
        )
      : [...location, locationValue];

    setLocation(nextLocations);

    void runSearch(degreeType, nextLocations);
  }

  return (
    <section className="space-y-5 p-6">
      <form
        onSubmit={handleSearch}
        className="flex w-full items-center gap-3"
      >
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search Programs..."
            className="w-full rounded-full border border-[var(--blue)] bg-transparent px-5 py-2 pr-12 text-[var(--blue)] outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            aria-label="Search programs"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--blue)]"
          >
            <Search className="size-5" />
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[175px_minmax(0,1fr)] gap-3">
        <aside className="h-fit bg-[#fff3c5] text-[var(--blue)]">
          <h2 className="bg-[#dfc35d] px-2 py-1 text-xl">
            Filters
          </h2>

          <div className="space-y-4 px-2 py-4">
            <fieldset>
              <legend className="mb-2 text-x1">
                Program Type
              </legend>

              {DEGREE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 py-1 text-base"
                >
                  <input
                    type="checkbox"
                    checked={degreeType.includes(
                      option.value,
                    )}
                    onChange={() =>
                      toggleDegreeType(option.value)
                    }
                    className="size-3 accent-[var(--blue)]"
                  />

                  <span>{option.label}</span>
                </label>
              ))}
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-x1">
                Location
              </legend>

              {LOCATION_OPTIONS.map((locationOption) => (
                <label
                  key={locationOption}
                  className="flex cursor-pointer items-center gap-2 py-1 text-base"
                >
                  <input
                    type="checkbox"
                    checked={location.includes(
                      locationOption,
                    )}
                    onChange={() =>
                      toggleLocation(locationOption)
                    }
                    className="size-3 accent-[var(--blue)]"
                  />

                  <span>{locationOption}</span>
                </label>
              ))}
            </fieldset>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-3">
            {degreeType.map((selectedDegree) => {
              const option = DEGREE_OPTIONS.find(
                (degreeOption) =>
                  degreeOption.value === selectedDegree,
              );

              return (
                <FilterChip
                  key={selectedDegree}
                  label={
                    option?.label ?? selectedDegree
                  }
                  onRemove={() =>
                    toggleDegreeType(selectedDegree)
                  }
                />
              );
            })}

            {location.map((selectedLocation) => (
              <FilterChip
                key={selectedLocation}
                label={selectedLocation}
                onRemove={() =>
                  toggleLocation(selectedLocation)
                }
              />
            ))}
          </div>

          {error && (
            <p className="mb-4 text-red-600">{error}</p>
          )}

          {!loading &&
            !error &&
            programs.length === 0 && (
              <p className="text-[var(--blue)]">
                Search for programs to see results.
              </p>
            )}

          <div className="space-y-4">
            {programs.map((program) => (
              <ProgramResultCard
                key={program.program_id}
                result={program}
                saved={savedProgramIds.includes(
                  program.program_id,
                )}
                onSave={handleSaveProgram}
                expandedProfessorId={
                  expandedProfessorId
                }
                papersByProfessor={papersByProfessor}
                loadingProfessorId={loadingProfessorId}
                onProfessorClick={handleProfessorClick}
              />
            ))}
          </div>
        </main>
      </div>
    </section>
  );
}

export function ProgramResultCard({
  result,
  saved = false,
  onSave,
  expandedProfessorId,
  papersByProfessor,
  loadingProfessorId,
  onProfessorClick,
}: ProgramResultCardProps) {
  const duration =
    result.program_start !== null &&
    result.program_end !== null
      ? result.program_end - result.program_start
      : null;

  return (
    <article className="relative min-h-[150px] border-l-4 border-[var(--gold)] bg-[#fff3c5] px-6 py-3">
      <button
        type="button"
        onClick={() => {
          void onSave?.(result.program_id);
        }}
        aria-label={
          saved ? "Remove saved program" : "Save program"
        }
        className="absolute right-5 top-4 flex size-10 items-center justify-center rounded-full bg-[var(--burgundy)] text-[var(--white)] hover:opacity-90"
      >
        <Heart
          className="size-6"
          fill={saved ? "currentColor" : "none"}
          strokeWidth={2}
        />
      </button>

      <p className="absolute right-6 top-15 text-xl text-[var(--blue)]">
        {result.match_score}% Match
      </p>

      <div className="pr-36">
        <h2 className="font-serif text-2xl leading-tight text-[var(--blue)]">
          {result.university.university_name}
        </h2>

        <p className="mt-1 text-xl text-[var(--blue)]">
          <em>
            {result.university.location ??
              "Location unavailable"}
          </em>

          <span className="ml-8">
            {result.degree_type}
            {duration !== null
              ? ` - ${duration} Years`
              : ""}
          </span>
        </p>

        <p className="mt-2 text-xl text-[var(--blue)]">
          {result.program_name}
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {result.professors.length === 0 && (
          <p className="text-lg text-[#637c9d]">
            No professors found.
          </p>
        )}

        {result.professors.slice(0, 3).map((professor) => {
          const isExpanded =
            expandedProfessorId ===
            professor.professor_id;

          const papers =
            papersByProfessor[
              professor.professor_id
            ] ?? [];

          return (
            <div
              key={professor.professor_id}
              className="grid grid-cols-[220px_1fr] gap-x-6 gap-y-2 text-lg"
            >
              <button
                type="button"
                onClick={() =>
                  onProfessorClick(
                    professor.professor_id,
                  )
                }
                aria-expanded={isExpanded}
                className="text-left font-bold text-[var(--blue)] underline-offset-2 hover:underline"
              >
                {professor.name}
              </button>

              <span className="text-[#637c9d]">
                Research:{" "}
                {professor.research_interests?.join(
                  ", ",
                ) ||
                  "Research information unavailable"}
              </span>

              {isExpanded && (
                <div className="col-span-2 max-h-48 overflow-y-auto rounded border bg-[#fff3c5] border-[var(--blue)] p-3 text-base">
                  {loadingProfessorId ===
                    professor.professor_id && (
                    <p className="text-[var(--blue)]">
                      Loading papers...
                    </p>
                  )}

                  {loadingProfessorId !==
                    professor.professor_id &&
                    papers.length === 0 && (
                      <p>No papers found.</p>
                    )}

                  {papers.map((paper) => (
                    <div
                      key={paper.paper_id}
                      className="border-b py-2 last:border-b-0"
                    >
                      <p className="font-semibold text-[var(--blue)]">
                        {paper.title}
                      </p>

                      {paper.publication_date && (
                        <p className="text-sm text-gray-600">
                          Published:{" "}
                          {paper.publication_date}
                        </p>
                      )}

                      {paper.link && (
                        <a
                          href={paper.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-[var(--blue)] underline"
                        >
                          View paper
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}