import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiUsers, FiTrendingUp, FiPlusCircle } from "react-icons/fi";
import { Card, Skeleton, EmptyState, Badge } from "../../components/ui/Primitives";
import Button from "../../components/ui/Button";
import hackathonService from "../../services/hackathonService";
import { formatDate, getHackathonPhase, phaseLabel, phaseVariant } from "../../utils/formatters";

const StatCard = ({ icon: Icon, label, value }) => (
  <Card className="flex items-center gap-4 p-5">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-forge text-white">
      <Icon size={19} />
    </div>
    <div>
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-[var(--ink-muted)]">{label}</p>
    </div>
  </Card>
);

const OrganizerOverview = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hackathonService
      .getMyHackathons({ limit: 6 })
      .then(({ hackathons: data }) => setHackathons(data))
      .catch((err) => console.error("Failed to load hackathons:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalRegistrations = hackathons.reduce((sum, h) => sum + (h.registeredCount || 0), 0);
  const liveCount = hackathons.filter((h) => ["published", "ongoing"].includes(h.status)).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Organizer Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">Manage your hackathons and track engagement.</p>
        </div>
        <Link to="/dashboard/organizer/create">
          <Button icon={<FiPlusCircle size={16} />}>Create Hackathon</Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={FiCalendar} label="Total hackathons" value={hackathons.length} />
        <StatCard icon={FiTrendingUp} label="Live or published" value={liveCount} />
        <StatCard icon={FiUsers} label="Total registrations" value={totalRegistrations} />
      </div>

      <div className="mt-10 flex items-end justify-between">
        <h2 className="font-display text-lg font-bold">Recent hackathons</h2>
        <Link to="/dashboard/organizer/hackathons" className="text-sm font-semibold text-volt-500 hover:underline">
          View all
        </Link>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : hackathons.length === 0 ? (
          <EmptyState
            icon={<FiCalendar />}
            title="No hackathons yet"
            description="Create your first hackathon to start accepting registrations."
            action={
              <Link to="/dashboard/organizer/create">
                <Button>Create Hackathon</Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {hackathons.map((h) => {
              const phase = getHackathonPhase(h);
              return (
                <Card key={h._id} className="flex items-center justify-between p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{h.title}</p>
                      <Badge variant={h.status === "draft" ? "neutral" : phaseVariant[phase]}>
                        {h.status === "draft" ? "Draft" : phaseLabel[phase]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-[var(--ink-muted)]">
                      {formatDate(h.startDate)} · {h.registeredCount} registered
                    </p>
                  </div>
                  <Link to={`/dashboard/organizer/hackathons/${h._id}`}>
                    <Button variant="secondary" size="sm">
                      Manage
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerOverview;
