import { Link } from "react-router-dom";
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from "react-icons/fi";
import Logo from "../common/Logo";

const footerLinks = {
  Platform: [
    { label: "Explore Hackathons", to: "/hackathons" },
    { label: "Project Gallery", to: "/gallery" },
    { label: "How it works", to: "/about" },
  ],
  Organizers: [
    { label: "Host a Hackathon", to: "/register" },
    { label: "Organizer Dashboard", to: "/dashboard/organizer" },
  ],
  Company: [
    { label: "About", to: "/about" },
    { label: "FAQ", to: "/about#faq" },
  ],
};

const Footer = () => (
  <footer className="border-t border-[var(--border)] bg-[var(--bg-elevated)]">
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
        <div className="col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-[var(--ink-muted)]">
            The platform where builders forge ideas into real projects — discover hackathons, form teams, ship
            fast, and get judged fairly.
          </p>
          <div className="mt-5 flex gap-3">
            {[FiGithub, FiTwitter, FiLinkedin, FiMail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--ink-muted)] transition hover:border-volt-500/50 hover:text-volt-500"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="mb-3 text-sm font-semibold font-display">{heading}</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-[var(--ink-muted)] transition hover:text-volt-500">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-6 sm:flex-row">
        <p className="text-xs text-[var(--ink-muted)]">© {new Date().getFullYear()} HackForge. Build. Compete. Win.</p>
        <div className="flex gap-5 text-xs text-[var(--ink-muted)]">
          <Link to="/privacy" className="hover:text-volt-500">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-volt-500">
            Terms
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
