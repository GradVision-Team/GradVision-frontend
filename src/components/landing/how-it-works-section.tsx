import { ImagePlaceholder } from "@/components/landing/image-placeholder";
import { cn } from "@/lib/utils";

type Step = {
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    title: "Create your account & onboard",
    description:
      "Sign up and answer a few quick questions about your background, interests, and where you hope to go.",
  },
  {
    title: "Define your vision",
    description:
      "Shape your goals, research interests, and personal statements in one place so your path stays clear.",
  },
  {
    title: "Explore programs & track applications",
    description:
      "Discover graduate programs that fit, then keep every application and task organized from your dashboard.",
  },
];

/** "How GradVision works" — three numbered steps, alternating image side on desktop. */
export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="w-full border-t border-[var(--blue)] px-4 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="how-it-works-heading"
          className="text-center font-[family-name:var(--font-lora)] text-3xl font-bold sm:text-5xl"
        >
          How GradVision works
        </h2>

        <ol className="mt-14 flex flex-col gap-16 sm:gap-24">
          {STEPS.map(({ title, description }, index) => (
            <li
              key={title}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-16"
            >
              <ImagePlaceholder
                className={cn(index % 2 === 1 && "md:order-last")}
              />
              <div className="flex flex-col gap-4 text-left">
                <span
                  aria-hidden
                  className="flex size-14 items-center justify-center rounded-full bg-[var(--gold)] font-[family-name:var(--font-lora)] text-3xl font-bold text-[var(--blue)]"
                >
                  {index + 1}
                </span>
                <h3 className="font-[family-name:var(--font-lora)] text-2xl font-bold sm:text-3xl">
                  {title}
                </h3>
                <p className="text-base leading-relaxed sm:text-lg">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
