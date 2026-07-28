import { NavLink } from "react-router-dom";
import { roleNavConfig, sharedNavItems } from "../../utils/roleNavConfig";

const NavItem = ({ to, label, icon: Icon, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-volt-500/10 text-volt-500 font-semibold"
          : "text-[var(--ink-muted)] hover:bg-[var(--border)]/50 hover:text-[var(--ink)]"
      }`
    }
  >
    <Icon size={17} />
    {label}
  </NavLink>
);

const Sidebar = ({ role, mobileOpen, onClose }) => {
  const items = roleNavConfig[role] || [];

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-6 transition-transform duration-300 lg:sticky lg:top-[65px] lg:z-0 lg:h-[calc(100vh-65px)] lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
            {role} dashboard
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
        <div className="my-4 border-t border-[var(--border)]" />
        <nav className="flex flex-col gap-1">
          {sharedNavItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
