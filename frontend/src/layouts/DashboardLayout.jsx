import { useState } from "react";
import { Outlet } from "react-router-dom";
import { FiMenu, FiSun, FiMoon, FiBell } from "react-icons/fi";
import { Link } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Logo from "../components/common/Logo";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useSocket } from "../context/SocketContext";

const DashboardLayout = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useSocket();
  const [mobileOpen, setMobileOpen] = useState(false);

  const unread = notifications.filter((n) => !n.isRead).length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-20 flex h-[65px] items-center justify-between border-b border-[var(--border)] bg-[var(--bg-elevated)]/90 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-2 text-[var(--ink-muted)] hover:bg-[var(--border)]/60 lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <FiMenu size={20} />
          </button>
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2.5 text-[var(--ink-muted)] transition hover:bg-[var(--border)]/60 hover:text-[var(--ink)]"
          >
            {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          <Link
            to="/dashboard/notifications"
            className="relative rounded-lg p-2.5 text-[var(--ink-muted)] transition hover:bg-[var(--border)]/60 hover:text-[var(--ink)]"
          >
            <FiBell size={18} />
            {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-ember-500 ring-2 ring-[var(--bg-elevated)]" />}
          </Link>
          <Link to="/dashboard/profile" className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-[var(--border)]/50">
            {user.avatar?.url ? (
              <img src={user.avatar.url} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-forge text-xs font-bold text-white">
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
          </Link>
        </div>
      </header>

      <div className="flex">
        <Sidebar role={user.role} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
