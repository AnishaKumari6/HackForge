import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlusCircle, FiCalendar } from "react-icons/fi";
import { Card, Skeleton, EmptyState, Badge } from "../../components/ui/Primitives";
import Button from "../../components/ui/Button";
import hackathonService from "../../services/hackathonService";
import { formatDate, getHackathonPhase, phaseLabel, phaseVariant } from "../../utils/formatters";

const MyHackathonsPage = () => {
  const [hackathons, setHackathons] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    hackathonService
      .getMyHackathons({ page, limit: 10 })
      .then(({ hackathons: data, meta: m }) => {
        setHackathons(data);
        setMeta(m);
      })
      .catch((err) => console.error("Failed to load hackathons:", err))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">My Hackathons</h1>
        <Link to="/dashboard/organizer/create">
          <Button icon={<FiPlusCircle size={16} />}>Create Hackathon</Button>
        </Link>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : hackathons.length === 0 ? (
          <EmptyState icon={<FiCalendar />} title="No hackathons yet" description="Create your first event to get started." />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {hackathons.map((h) => {
                const phase = getHackathonPhase(h);
                return (
                  <Card key={h._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold">{h.title}</p>
                        <Badge variant={h.status === "draft" ? "neutral" : phaseVariant[phase]}>
                          {h.status === "draft" ? "Draft" : phaseLabel[phase]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-[var(--ink-muted)]">
                        {formatDate(h.startDate)} – {formatDate(h.endDate)} · {h.registeredCount} registered
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
            {meta && meta.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button variant="secondary" size="sm" disabled={!meta.hasPrevPage} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="px-3 text-sm text-[var(--ink-muted)]">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <Button variant="secondary" size="sm" disabled={!meta.hasNextPage} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyHackathonsPage;
