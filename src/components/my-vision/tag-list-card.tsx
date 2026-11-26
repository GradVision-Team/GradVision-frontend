"use client";

import { useId, useState } from "react";

import { muted } from "@/components/dashboard/dashboard-ui";
import { EditableCard } from "@/components/my-vision/editable-card";
import { useSaveAction } from "@/components/my-vision/use-save-action";
import { updateCurrentUserProfile } from "@/lib/api";
import { cn } from "@/lib/utils";

type TagListCardProps = {
  title: string;
  /** What the pencil edits, lowercase: "research interests". */
  editLabel: string;
  /** Which backend field this card saves to. */
  field: "research_interests" | "program_interests";
  initialValues: string[];
  /** Preset choices. Saved values that aren't in this list are kept and shown too. */
  presetOptions: readonly string[];
  isSample: boolean;
};

/**
 * Shows a list of gold chips; the pencil turns them into toggle chips.
 * Used for both Research Interests and Program Interests.
 */
export function TagListCard({
  title,
  editLabel,
  field,
  initialValues,
  presetOptions,
  isSample,
}: TagListCardProps) {
  const [values, setValues] = useState(initialValues);
  const [draft, setDraft] = useState(initialValues);
  const save = useSaveAction(isSample);
  const groupId = useId();

  // Presets first, then anything the user already has that isn't a preset
  // (e.g. values from older data), so editing never silently drops them.
  const options = [...presetOptions, ...values.filter((value) => !presetOptions.includes(value))];

  function toggle(option: string) {
    setDraft((current) =>
      current.includes(option) ? current.filter((v) => v !== option) : [...current, option],
    );
  }

  async function onSave(): Promise<string | null> {
    // Onboarding treats an empty list as "not finished", so don't allow saving one.
    if (draft.length === 0) return `Select at least one of your ${editLabel}.`;

    const message = await save(() => updateCurrentUserProfile({ [field]: draft }));
    if (message === null) setValues(draft);
    return message;
  }

  return (
    <EditableCard
      title={title}
      editLabel={editLabel}
      onStartEdit={() => setDraft(values)}
      onSave={onSave}
      view={
        values.length === 0 ? (
          <p className={cn("text-sm", muted)}>None yet. Use the pencil to add some.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {values.map((value) => (
              <li
                key={value}
                className="rounded-full bg-[#f4e6cc] px-3.5 py-1.5 text-xs font-semibold text-[#8a5a22]"
              >
                {value}
              </li>
            ))}
          </ul>
        )
      }
      edit={
        <div role="group" aria-labelledby={groupId} className="flex flex-col gap-2">
          <p id={groupId} className={cn("text-xs", muted)}>
            Select all that apply.
          </p>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const selected = draft.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggle(option)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue)]",
                    selected
                      ? "border-[var(--blue)] bg-[var(--blue)] text-white"
                      : "border-(--blue) bg-white text-[var(--blue)] hover:bg-[var(--cream)]",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      }
    />
  );
}
