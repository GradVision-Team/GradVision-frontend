"use client";

import { useId, useState } from "react";

import { muted } from "@/components/dashboard/dashboard-ui";
import { EditableCard, fieldClassName } from "@/components/my-vision/editable-card";
import { useSaveAction } from "@/components/my-vision/use-save-action";
import { updateCurrentUserProfile } from "@/lib/api";
import { goalsFromString, goalsToString } from "@/lib/profile";
import { cn } from "@/lib/utils";

/**
 * Goals are stored as one `personal_statement` string (the onboarding
 * "Academic or career goals" text). Each line is shown as a bullet.
 */
export function GoalsCard({
  initialGoals,
  isSample,
}: {
  initialGoals: string[];
  isSample: boolean;
}) {
  const [goals, setGoals] = useState(initialGoals);
  const [draft, setDraft] = useState(goalsToString(initialGoals));
  const save = useSaveAction(isSample);
  const fieldId = useId();

  async function onSave(): Promise<string | null> {
    const next = goalsFromString(draft);
    // Onboarding treats an empty goals text as "not finished", so don't allow saving one.
    if (next.length === 0) return "Add at least one goal.";

    const message = await save(() =>
      updateCurrentUserProfile({ personal_statement: goalsToString(next) }),
    );
    if (message === null) setGoals(next);
    return message;
  }

  return (
    <EditableCard
      title="Goals"
      editLabel="goals"
      onStartEdit={() => setDraft(goalsToString(goals))}
      onSave={onSave}
      view={
        goals.length === 0 ? (
          <p className={cn("text-sm", muted)}>No goals yet. Use the pencil to add some.</p>
        ) : (
          <ul className="list-disc space-y-1.5 pl-5 text-sm marker:text-[var(--blue)]">
            {goals.map((goal, index) => (
              <li key={`${index}-${goal}`}>{goal}</li>
            ))}
          </ul>
        )
      }
      edit={
        <div>
          <label htmlFor={fieldId} className="mb-1 block text-xs font-semibold">
            Your goals
          </label>
          <textarea
            id={fieldId}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={5}
            autoFocus
            className={cn(fieldClassName, "resize-y")}
            aria-describedby={`${fieldId}-hint`}
          />
          <p id={`${fieldId}-hint`} className={cn("mt-1 text-xs", muted)}>
            One goal per line.
          </p>
        </div>
      }
    />
  );
}
