import { forwardRef } from "react";

const Input = forwardRef(({ label, error, icon, className = "", containerClassName = "", ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-[var(--ink)]" htmlFor={props.id}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]">{icon}</span>}
        <input
          ref={ref}
          className={`w-full rounded-xl border bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-none transition-all duration-200 focus:ring-2 focus:ring-volt-500/40 ${
            error ? "border-danger" : "border-[var(--border)] focus:border-volt-500"
          } ${icon ? "pl-10" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
