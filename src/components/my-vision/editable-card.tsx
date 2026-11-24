"use client";

import { Pencil } from "lucide-react";
import { useId, useState, type FormEvent, type ReactNode } from "react";

import {
  CardHeading,
  DashboardCard,
  primaryButton,
} from "@/components/dashboard/dashboard-ui";
export const secondaryButton =
  "inline-flex items-center justify-center rounded-md border border-[#a9bac3] bg-white px-3 py-1.5 text-[11px] font-bold text-[var(--blue)] transition-colors hover:bg-[#f8f3e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue)] disabled:opacity-50";

export const fieldClassName =
  "w-full rounded-md border border-[#a9bac3] bg-white px-3 py-2 text-sm text-[var(--blue)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--blue)]";

export const fieldLabelClassName = "mb-1 block text-xs font-semibold";

/** Round pencil button used to start editing (also used by the statement rows). */
export function EditButton({
  label,
  onClick,
}: {
  /** What is being edited, e.g. "research interests". Becomes "Edit research interests". */
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Edit ${label}`}
      onClick={onClick}
      className="shrink-0 rounded-md p-1.5 text-[var(--blue)] transition-colors hover:bg-[#ddeaf0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue)]"
    >
      <Pencil className="size-4" aria-hidden="true" />
    </button>
  );
}

export function FormError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="text-xs text-[var(--burgundy)]">
      {children}
    </p>
  );
}

type EditableCardProps = {
  /** Card title. Also names the card for screen readers. */
  title: string;
  /** Hide the visible title (the identity card shows the user's name instead). */
  hideTitle?: boolean;
  /** What the pencil edits, lowercase: "research interests". */
  editLabel: string;
  /** Read-only content. */
  view: ReactNode;
  /** The form fields shown while editing. */
  edit: ReactNode;
  /** Called when editing starts, so the card can reset its draft from the saved value. */
  onStartEdit: () => void;
  /**
   * Called on Save. Return an error message to keep the form open and show it,
   * or null once the change is saved.
   */
  onSave: () => Promise<string | null>;
};

/**
 * Card frame for a section that can be edited in place:
 * a pencil swaps the card into a form with Save / Cancel.
 * The card keeps its own draft; this component owns the editing/saving/error state.
 */
export function EditableCard({
  title,
  hideTitle = false,
  editLabel,
  view,
  edit,
  onStartEdit,
  onSave,
}: EditableCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const errorId = useId();

  function startEditing() {
    onStartEdit();
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setError(null);
    setEditing(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError(null);
    try {
      const message = await onSave();
      if (message) setError(message);
      else setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const editButton = <EditButton label={editLabel} onClick={startEditing} />;

  if (editing) {
    return (
      <DashboardCard aria-labelledby={titleId}>
        {hideTitle ? (
          <h2 id={titleId} className="sr-only">
            {title}
          </h2>
        ) : (
          <CardHeading id={titleId} title={title} />
        )}
        <form onSubmit={submit} aria-describedby={error ? errorId : undefined} className="flex flex-col gap-4">
          {edit}
          {error && <FormError id={errorId}>{error}</FormError>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className={primaryButton}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={cancel} disabled={saving} className={secondaryButton}>
              Cancel
            </button>
          </div>
        </form>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard aria-labelledby={titleId}>
      {hideTitle ? (
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="sr-only">
            {title}
          </h2>
          <div className="min-w-0 flex-1">{view}</div>
          {editButton}
        </div>
      ) : (
        <>
          <CardHeading id={titleId} title={title} action={editButton} />
          <div className="min-w-0">{view}</div>
        </>
      )}
    </DashboardCard>
  );
}
