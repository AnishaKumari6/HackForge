import { forwardRef } from "react";

export const Textarea = forwardRef(({ label, error, className = "", containerClassName = "", ...props }, ref) => (
  <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
    {label && (
      <label className="text-sm font-medium text-[var(--ink)]" htmlFor={props.id}>
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      className={`w-full rounded-xl border bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-none transition-all duration-200 focus:ring-2 focus:ring-volt-500/40 resize-y ${
        error ? "border-danger" : "border-[var(--border)] focus:border-volt-500"
      } ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-danger">{error}</span>}
  </div>
));
Textarea.displayName = "Textarea";

export const Select = forwardRef(({ label, error, className = "", containerClassName = "", children, ...props }, ref) => (
  <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
    {label && (
      <label className="text-sm font-medium text-[var(--ink)]" htmlFor={props.id}>
        {label}
      </label>
    )}
    <select
      ref={ref}
      className={`w-full rounded-xl border bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--ink)] outline-none transition-all duration-200 focus:ring-2 focus:ring-volt-500/40 ${
        error ? "border-danger" : "border-[var(--border)] focus:border-volt-500"
      } ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <span className="text-xs text-danger">{error}</span>}
  </div>
));
Select.displayName = "Select";
