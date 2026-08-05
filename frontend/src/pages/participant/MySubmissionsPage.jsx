import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiFileText } from "react-icons/fi";
import { Card, Skeleton, EmptyState, Badge } from "../../components/ui/Primitives";
import Button from "../../components/ui/Button";
import registrationService from "../../services/registrationService";

const statusVariant = { draft: "neutral", submitted: "success", under_review: "warning", reviewed: "volt" };

const MySubmissionsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registrationService
      .getMyRegistrations()
      .then((res) => {
        const map = new Map();
        const regs = res?.registrations || [];
        regs
          .filter((r) => r.team && r.status === "approved")
          .forEach((r) => map.set(r.team._id, { ...r.team, hackathon: r.hackathon }));
        setTeams(Array.from(map.values()));
      })
      .catch((err) => console.error("Failed to load submissions:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">My Submissions</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">Manage your project submissions for approved teams.</p>

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !teams || teams.length === 0 ? (
          <EmptyState
            icon={<FiFileText />}
            title="No approved teams yet"
            description="Once your team is approved by an organizer, you can submit your project here."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {teams.map((team) => (
              <Card key={team._id} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-semibold">{team.hackathon?.title}</p>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">Team: {team.name}</p>
                </div>
                <Link to={`/dashboard/participant/submissions/${team.hackathon._id}?team=${team._id}`}>
                  <Button variant="secondary" size="sm">
                    Open editor
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubmissionsPage;
