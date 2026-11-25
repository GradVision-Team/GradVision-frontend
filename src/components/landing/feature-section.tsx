import { Compass, ListChecks, Target, type LucideIcon } from "lucide-react";

type Feature = {
  title: string;
  points: string[];
  icon: LucideIcon;
};

const FEATURES: Feature[] = [
  {
    title: "Explore",
    points: [
      "Browse graduate programs, professors and faculty, and their research",
      "Everything in one place, with no browser switching to get information",
    ],
    icon: Compass,
  },
  {
    title: "Organize",
    points: [
      "Save programs",
      "Manage application items and deadlines",
      "Create tasks and events",
    ],
    icon: ListChecks,
  },
  {
    title: "Define",
    points: [
      "Discover and log your graduate school and career interests",
      "Set short-term and long-term goals that support that vision",
    ],
    icon: Target,
  },
];

/** "What you can do with GradVision" — three feature cards with bullet points. */
export function FeatureSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="w-full border-t border-[var(--blue)] bg-[var(--cream)] px-4 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="features-heading"
          className="text-center font-[family-name:var(--font-lora)] text-3xl font-bold sm:text-5xl"
        >
          What you can do with GradVision
        </h2>

        <ul className="mt-14 grid gap-8 md:grid-cols-3">
          {FEATURES.map(({ title, points, icon: Icon }) => (
            <li
              key={title}
              className="flex flex-col gap-5 rounded-[12px] border border-[var(--blue)] bg-[var(--white)] p-6 text-left"
            >
              <div className="flex items-center gap-3">
                <Icon
                  className="size-7 shrink-0 text-[var(--burgundy)]"
                  strokeWidth={2}
                  aria-hidden
                />
                <h3 className="font-[family-name:var(--font-lora)] text-2xl font-bold">
                  {title}
                </h3>
              </div>
              <ul className="list-disc space-y-1.5 pl-5 text-base leading-relaxed marker:text-[var(--blue)] sm:text-lg">
                {points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
