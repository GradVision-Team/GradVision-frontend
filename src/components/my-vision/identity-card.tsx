"use client";

import { useId, useState } from "react";

import { muted } from "@/components/dashboard/dashboard-ui";
import {
  EditableCard,
  fieldClassName,
  fieldLabelClassName,
} from "@/components/my-vision/editable-card";
import { useSaveAction } from "@/components/my-vision/use-save-action";
import { updateCurrentUserProfile } from "@/lib/api";
import {
  formatEducationLine,
  primaryEducationIndex,
  withPrimaryEducation,
  type EducationPayload,
} from "@/lib/profile";
import { cn } from "@/lib/utils";

type Identity = {
  firstName: string;
  lastName: string;
  education: EducationPayload[];
};

type Draft = {
  firstName: string;
  lastName: string;
  university: string;
  major: string;
};

function toDraft({ firstName, lastName, education }: Identity): Draft {
  const entry = education[primaryEducationIndex(education)];
  return {
    firstName,
    lastName,
    university: entry?.university_name ?? "",
    major: entry?.major ?? "",
  };
}

export function IdentityCard({
  initial,
  isSample,
}: {
  initial: Identity;
  isSample: boolean;
}) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial));
  const save = useSaveAction(isSample);
  const formId = useId();

  const fullName = `${saved.firstName} ${saved.lastName}`.trim();
  const educationLine = formatEducationLine(saved.education);

  async function onSave(): Promise<string | null> {
    const next = {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      university: draft.university.trim(),
      major: draft.major.trim(),
    };
    if (!next.firstName || !next.lastName) return "Enter your first and last name.";
    if (!next.university) return "Enter your university.";

    const education = withPrimaryEducation(saved.education, {
      university_name: next.university,
      major: next.major,
    });

    const message = await save(() =>
      updateCurrentUserProfile({
        first_name: next.firstName,
        last_name: next.lastName,
        past_education: education,
      }),
    );
    if (message === null) {
      setSaved({ firstName: next.firstName, lastName: next.lastName, education });
    }
    return message;
  }

  const field = (key: keyof Draft, label: string, autoComplete?: string) => (
    <div>
      <label htmlFor={`${formId}-${key}`} className={fieldLabelClassName}>
        {label}
      </label>
      <input
        id={`${formId}-${key}`}
        value={draft[key]}
        onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
        autoComplete={autoComplete}
        className={fieldClassName}
      />
    </div>
  );

  return (
    <EditableCard
      title="Profile"
      hideTitle
      editLabel="name and school"
      onStartEdit={() => setDraft(toDraft(saved))}
      onSave={onSave}
      view={
        <>
          <p className="font-[family-name:var(--font-lora)] text-[28px] leading-tight">
            {fullName}
          </p>
          <p className={cn("mt-1.5 text-sm", muted)}>
            {educationLine || "Add your school and major with the pencil."}
          </p>
        </>
      }
      edit={
        <div className="grid gap-3 sm:grid-cols-2">
          {field("firstName", "First name", "given-name")}
          {field("lastName", "Last name", "family-name")}
          {field("university", "University")}
          {field("major", "Major")}
        </div>
      }
    />
  );
}
