import { cn } from "@/lib/utils";

type OptionGroupBaseProps = {
  legendId: string;
  legend: string;
  options: readonly string[];
  describedBy?: string;
  invalid?: boolean;
};

type CheckboxOptionGroupProps = OptionGroupBaseProps & {
  type: "checkbox";
  values: string[];
  onChange: (values: string[]) => void;
};

type RadioOptionGroupProps = OptionGroupBaseProps & {
  type: "radio";
  name: string;
  value: string | null;
  onChange: (value: string) => void;
};

type OptionGroupProps = CheckboxOptionGroupProps | RadioOptionGroupProps;

const optionClassName = cn(
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-[12px] border border-[var(--blue)] bg-[var(--white)] px-4 py-3 text-base",
  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--blue)] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[var(--cream)]",
);

export function OptionGroup(props: OptionGroupProps) {
  const { legendId, legend, options, describedBy, invalid } = props;

  return (
    <fieldset
      className="flex flex-col gap-3"
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
    >
      <legend id={legendId} className="text-base font-medium">
        {legend}
      </legend>
      <div className="flex flex-col gap-2" role="group" aria-labelledby={legendId}>
        {options.map((option) => {
          const optionId = `${legendId}-${option.replace(/\s+/g, "-").toLowerCase()}`;

          if (props.type === "checkbox") {
            const checked = props.values.includes(option);

            return (
              <label key={option} htmlFor={optionId} className={optionClassName}>
                <input
                  id={optionId}
                  type="checkbox"
                  checked={checked}
                  className="size-4 shrink-0 accent-[var(--blue)]"
                  onChange={(event) => {
                    if (event.target.checked) {
                      props.onChange([...props.values, option]);
                      return;
                    }
                    props.onChange(props.values.filter((value) => value !== option));
                  }}
                />
                <span>{option}</span>
              </label>
            );
          }

          return (
            <label key={option} htmlFor={optionId} className={optionClassName}>
              <input
                id={optionId}
                type="radio"
                name={props.name}
                value={option}
                checked={props.value === option}
                className="size-4 shrink-0 accent-[var(--blue)]"
                onChange={() => props.onChange(option)}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
