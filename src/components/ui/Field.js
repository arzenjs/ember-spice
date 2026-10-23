import { cn } from "@/lib/utils";

export const inputClass =
  "block w-full min-h-11 rounded-lg border border-sand/30 bg-ember-black px-4 py-2.5 text-base text-ivory placeholder:text-sand/50 focus-visible:border-copper-soft aria-[invalid=true]:border-red-400 disabled:opacity-60";

// Label + control + hint/error wiring in one place so every form gets the same accessibility behaviour.
export function Field({ label, name, error, hint, className, children }) {
  const describedBy = [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-sand">
        {label}
      </label>
      {children({ id: name, name, "aria-invalid": error ? "true" : undefined, "aria-describedby": describedBy, className: inputClass })}
      {hint && !error && <p id={`${name}-hint`} className="mt-2 text-sm text-sand">{hint}</p>}
      {error && <p id={`${name}-error`} className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}

export function TextField({ label, name, error, hint, className, ...input }) {
  return (
    <Field label={label} name={name} error={error} hint={hint} className={className}>
      {(a11y) => <input {...a11y} {...input} />}
    </Field>
  );
}

export function SelectField({ label, name, error, hint, className, children, ...select }) {
  return (
    <Field label={label} name={name} error={error} hint={hint} className={className}>
      {(a11y) => <select {...a11y} {...select}>{children}</select>}
    </Field>
  );
}
