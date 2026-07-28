import { forwardRef } from "react";
import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-volt-500 text-white hover:bg-volt-600 transition-colors shadow-sm active:bg-volt-700",
  secondary:
    "bg-white text-[var(--ink-muted)] border border-[var(--border)] hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)] hover:border-slate-300 transition-colors shadow-sm",
  ghost: "bg-transparent text-[var(--ink-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)] transition-colors",
  danger: "bg-danger text-white hover:bg-red-600 transition-colors shadow-sm",
  outline: "bg-transparent border border-[var(--border)] text-[var(--ink-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)] transition-colors shadow-sm",
};

const sizes = {
  sm: "h-9 px-3.5 text-sm rounded-lg gap-1.5",
  md: "h-11 px-5 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2.5",
};

const Button = forwardRef(
  ({ variant = "primary", size = "md", className = "", children, isLoading, disabled, icon, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          icon
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
