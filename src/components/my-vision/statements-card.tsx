"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";

import {
  CardHeading,
  DashboardCard,
  EmptyNote,
  muted,
  primaryButton,
} from "@/components/dashboard/dashboard-ui";
import {
  EditButton,
  FormError,
  fieldClassName,
  secondaryButton,
} from "@/components/my-vision/editable-card";
import { useSaveAction } from "@/components/my-vision/use-save-action";
import { updateApplicationStatementUrl } from "@/lib/api";
import type { Application } from "@/lib/dashboard";
import {
  STATEMENT_URL_ERROR,
  isValidStatementUrl,
  normalizeStatementUrl,
  statementTitle,
} from "@/lib/profile";
import { cn } from "@/lib/utils";

type StatementRowProps = {
  application: Application;
  /** The saved link for this application (null when there isn't one). */
  url: string | null;
  isSample: boolean;
  onSaved: (applicationId: number, url: string | null) => void;
};

function StatementRow({ application, url, isSample, onSaved }: StatementRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = useSaveAction(isSample);
  const fieldId = useId();

  // The link goes into an href, so only render it as one if it is a valid http(s) URL.
  const openUrl = url && isValidStatementUrl(url) ? url : null;
  const title = statementTitle(application);

  function startEditing() {
    setDraft(url ?? "");
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setError(null);
    setEditing(false);
  }

  async function persist(next: string | null) {
    setSaving(true);
    setError(null);
    try {
      const message = await save(() => updateApplicationStatementUrl(application.application_id, next));
      if (message) {
        setError(message);
        return;
      }
      onSaved(application.application_id, next);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const normalized = normalizeStatementUrl(draft);
    if (normalized === null) {
      setError(STATEMENT_URL_ERROR);
      return;
    }
    await persist(normalized);
  }

  return (
    <li className="rounded-[10px] bg-[#f8f3e5] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className={cn("text-[11px]", muted)}>{application.program_name}</p>
        </div>

        {!editing && (
          <div className="flex items-center gap-1.5">
            {openUrl ? (
              <a
                href={openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={primaryButton}
              >
                OPEN
                <span className="sr-only"> {title} (opens in a new tab)</span>
              </a>
            ) : (
              <span className={cn("text-xs", muted)}>No link yet</span>
            )}
            <EditButton label={`link for ${title}`} onClick={startEditing} />
          </div>
        )}
      </div>

      {editing && (
        <form onSubmit={submit} className="mt-3 flex flex-col gap-2">
          <label htmlFor={fieldId} className="text-xs font-semibold">
            Link to your statement (for example, a Google Doc)
          </label>
          <input
            id={fieldId}
            type="url"
            inputMode="url"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="https://docs.google.com/document/…"
            autoFocus
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${fieldId}-error` : undefined}
            className={fieldClassName}
          />
          {error && <FormError id={`${fieldId}-error`}>{error}</FormError>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className={primaryButton}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={cancel} disabled={saving} className={secondaryButton}>
              Cancel
            </button>
            {url && (
              <button
                type="button"
                disabled={saving}
                onClick={() => persist(null)}
                className={cn(secondaryButton, "ml-auto text-[var(--burgundy)]")}
              >
                Remove link
              </button>
            )}
          </div>
        </form>
      )}
    </li>
  );
}

/**
 * Personal statements are written in an external doc (e.g. Google Docs) and
 * linked to the application they are for. One row per application.
 */
export function StatementsCard({
  applications,
  isSample,
}: {
  applications: Application[];
  isSample: boolean;
}) {
  const [links, setLinks] = useState<Record<number, string | null>>(() =>
    Object.fromEntries(applications.map((app) => [app.application_id, app.statement_url ?? null])),
  );

  return (
    <DashboardCard aria-labelledby="statements-title">
      <CardHeading
        id="statements-title"
        title="Personal Statements"
        subtitle="Write your statements in a document, then link each one to its application."
      />

      {applications.length === 0 ? (
        <EmptyNote>
          No applications yet.{" "}
          <Link href="/explore" className="font-medium underline underline-offset-2">
            Find a program in Explore
          </Link>{" "}
          to start one and link your statement here.
        </EmptyNote>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {applications.map((application) => (
            <StatementRow
              key={application.application_id}
              application={application}
              url={links[application.application_id] ?? null}
              isSample={isSample}
              onSaved={(id, url) => setLinks((current) => ({ ...current, [id]: url }))}
            />
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
