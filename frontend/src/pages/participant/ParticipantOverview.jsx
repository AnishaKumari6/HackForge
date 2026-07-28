import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheckSquare, FiUsers, FiFileText, FiArrowRight } from "react-icons/fi";
import { Card, Skeleton, EmptyState } from "../../components/ui/Primitives";
import HackathonCard from "../../components/hackathon/HackathonCard";
import registrationService from "../../services/registrationService";
import hackathonService from "../../services/hackathonService";

const StatCard = ({ icon: Icon, label, value, to }) => (
  <Link to={to}>
    <Card hover className="flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-forge text-white">
        <Icon size={19} />
      </div>
      <div>
        <p className="font-display text-2xl font-bold">{value}</p>
        <p className="text-xs text-[var(--ink-muted)]">{label}</p>
      </div>
    </Card>
  </Link>
);

const ParticipantOverview = () => {
  const [registrations, setRegistrations] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([registrationService.getMyRegistrations(), hackathonService.getFeatured()])
      .then(([regRes, featRes]) => {
        setRegistrations(regRes.registrations);
        setFeatured(featRes.hackathons.slice(0, 3));
      })
      .catch((err) => console.error("Failed to load overview:", err))
      .finally(() => setLoading(false));
  }, []);

  const approvedCount = registrations.filter((r) => r.status === "approved").length;
  const teamCount = new Set(registrations.map((r) => r.team?._id).filter(Boolean)).size;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Welcome back 👋</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">Here's what's happening across your hackathons.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={FiCheckSquare} label="Active registrations" value={approvedCount} to="/dashboard/participant/registrations" />
        <StatCard icon={FiUsers} label="Teams joined" value={teamCount} to="/dashboard/participant/teams" />
        <StatCard icon={FiFileText} label="Total registrations" value={registrations.length} to="/dashboard/participant/submissions" />
      </div>

      <div className="mt-10 flex items-end justify-between">
        <h2 className="font-display text-lg font-bold">Discover more hackathons</h2>
        <Link to="/hackathons" className="flex items-center gap-1 text-sm font-semibold text-volt-500 hover:underline">
          Browse all <FiArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <EmptyState title="No hackathons available" description="Check back soon." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {featured.map((h, i) => (
              <HackathonCard key={h._id} hackathon={h} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantOverview;
