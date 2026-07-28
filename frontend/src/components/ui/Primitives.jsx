import { motion } from "framer-motion";

export const Card = ({ children, className = "", hover = false, glass = false, ...props }) => (
  <div
    className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm ${
      hover ? "transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md" : ""
    } ${className}`}
    {...props}
  >
    {children}
  </div>
);

const badgeVariants = {
  neutral: "bg-slate-100 text-slate-700 border border-slate-200/50 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/50",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
  warning: "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
  danger: "bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50",
  volt: "bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50",
  ember: "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
};

export const Badge = ({ children, variant = "neutral", className = "", dot = false }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeVariants[variant]} ${className}`}
  >
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
    {children}
  </span>
);

export const Spinner = ({ size = 24, className = "" }) => (
  <svg className={`animate-spin ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export const PageSpinner = () => (
  <div className="flex min-h-[60vh] w-full items-center justify-center">
    <Spinner size={36} className="text-volt-500" />
  </div>
);

export const Skeleton = ({ className = "" }) => <div className={`skeleton ${className}`} />;

export const EmptyState = ({ icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border)] px-8 py-16 text-center"
  >
    {icon && <div className="text-4xl text-[var(--ink-muted)]">{icon}</div>}
    <h3 className="text-lg font-semibold font-display text-[var(--ink)]">{title}</h3>
    {description && <p className="max-w-sm text-sm text-[var(--ink-muted)]">{description}</p>}
    {action}
  </motion.div>
);
