import { motion } from "framer-motion";
import Logo from "../../components/common/Logo";

const AuthLayout = ({ title, subtitle, children }) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-50/40 via-[var(--bg-elevated)] to-[var(--bg)] dark:from-indigo-950/20 lg:flex lg:flex-col lg:justify-between lg:p-12 border-r border-[var(--border)]">
      <Logo />

      <div className="relative z-10 max-w-md">
        <h2 className="font-display text-4xl font-bold leading-tight">
          Where builders <span className="text-volt-500">forge</span> ideas into shipped projects.
        </h2>
        <p className="mt-4 text-[var(--ink-muted)]">
          Join thousands of developers competing, collaborating, and getting discovered at hackathons worldwide.
        </p>
        <div className="mt-8 flex -space-x-3">
          {["A", "S", "K", "M", "V"].map((letter, i) => (
            <div
              key={i}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--bg-elevated)] bg-volt-500 text-sm font-bold text-white shadow-sm"
            >
              {letter}
            </div>
          ))}
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--bg-elevated)] bg-[var(--surface)] text-xs font-semibold text-[var(--ink-muted)] shadow-sm">
            2k+
          </div>
        </div>
      </div>

      <p className="relative z-10 text-xs text-[var(--ink-muted)]">© {new Date().getFullYear()} HackForge</p>
    </div>

    <div className="flex items-center justify-center px-6 py-12 sm:px-10 bg-[var(--surface)]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-[var(--ink-muted)]">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </motion.div>
    </div>
  </div>
);

export default AuthLayout;
