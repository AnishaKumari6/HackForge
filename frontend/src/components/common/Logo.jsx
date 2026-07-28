import { Link } from "react-router-dom";

const Logo = ({ className = "", iconOnly = false }) => (
  <Link to="/" className={`inline-flex items-center gap-2 select-none ${className}`}>
    <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-volt-500 shadow-sm">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L4 7v10l8 5 8-5V7l-8-5z"
          stroke="white"
          strokeWidth="1.6"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M8 10.5l4-2.5 4 2.5-4 2.5-4-2.5z" fill="white" />
        <path d="M12 13v6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
    {!iconOnly && <span className="font-display text-lg font-bold tracking-tight">HackForge</span>}
  </Link>
);

export default Logo;
