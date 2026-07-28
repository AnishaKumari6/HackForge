import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiSun, FiMoon, FiMenu, FiX, FiBell, FiChevronDown, FiLogOut, FiGrid, FiUser } from "react-icons/fi";
import Logo from "../common/Logo";
import Button from "../ui/Button";
import { Badge } from "../ui/Primitives";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useSocket } from "../../context/SocketContext";

const navLinks = [
  { to: "/hackathons", label: "Explore" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useSocket();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] glass-panel">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-volt-500" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg p-2.5 text-[var(--ink-muted)] transition hover:bg-[var(--border)]/60 hover:text-[var(--ink)]"
          >
            {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {user ? (
            <>
              <Link
                to="/dashboard/notifications"
                className="relative hidden rounded-lg p-2.5 text-[var(--ink-muted)] transition hover:bg-[var(--border)]/60 hover:text-[var(--ink)] sm:block"
              >
                <FiBell size={18} />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-ember-500 ring-2 ring-[var(--bg)]" />
                )}
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2.5 transition hover:bg-[var(--border)]/60"
                >
                  {user.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-forge text-xs font-bold text-white">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <FiChevronDown size={14} className="hidden text-[var(--ink-muted)] sm:block" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
                    >
                      <div className="border-b border-[var(--border)] px-4 py-3">
                        <p className="truncate text-sm font-semibold">{user.name}</p>
                        <Badge variant="volt" className="mt-1 capitalize">
                          {user.role}
                        </Badge>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[var(--border)]/40"
                      >
                        <FiGrid size={16} /> Dashboard
                      </Link>
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[var(--border)]/40"
                      >
                        <FiUser size={16} /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-danger hover:bg-danger/10"
                      >
                        <FiLogOut size={16} /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Log in
              </Button>
              <Button size="sm" onClick={() => navigate("/register")}>
                Get started
              </Button>
            </div>
          )}

          <button
            className="rounded-lg p-2.5 text-[var(--ink-muted)] hover:bg-[var(--border)]/60 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--border)] md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[var(--border)]/40"
                >
                  {link.label}
                </NavLink>
              ))}
              {!user && (
                <div className="mt-2 flex gap-2 border-t border-[var(--border)] pt-3">
                  <Button variant="secondary" className="flex-1" onClick={() => navigate("/login")}>
                    Log in
                  </Button>
                  <Button className="flex-1" onClick={() => navigate("/register")}>
                    Get started
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
