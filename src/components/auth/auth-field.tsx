import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

type AuthFieldProps = {
  id: string;
  label: string;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  | "name"
  | "type"
  | "autoComplete"
  | "required"
  | "minLength"
  | "placeholder"
  | "value"
  | "defaultValue"
  | "onChange"
  | "min"
  | "max"
  | "inputMode"
  | "aria-describedby"
  | "aria-invalid"
>;

export const authInputClassName = cn(
  "h-12 w-full rounded-[12px] border border-[var(--blue)] bg-[var(--white)] px-4 text-base text-[var(--blue)]",
  "outline-none placeholder:text-[color-mix(in_srgb,var(--blue)_55%,transparent)]",
  "focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cream)]",
);

export function AuthField({
  id,
  label,
  name,
  type,
  autoComplete,
  required = true,
  minLength,
  placeholder,
  value,
  defaultValue,
  onChange,
  min,
  max,
  inputMode,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        min={min}
        max={max}
        inputMode={inputMode}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        className={authInputClassName}
      />
    </div>
  );
}
