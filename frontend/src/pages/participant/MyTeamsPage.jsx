import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import { Card, Skeleton, EmptyState, Badge } from "../../components/ui/Primitives";
import Button from "../../components/ui/Button";
import registrationService from "../../services/registrationService";

const statusVariant = { forming: "neutral", pending_approval: "warning", approved: "success", rejected: "danger" };

const MyTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registrationService
      .getMyRegistrations()
      .then(({ registrations }) => {
        // Registrations only exist for approved teams; dedupe by team id.
        const map = new Map();
        registrations.forEach((r) => {
          if (r.team) map.set(r.team._id, { ...r.team, hackathon: r.hackathon });
        });
        setTeams(Array.from(map.values()));
      })
      .catch((err) => console.error("Failed to load teams:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">My Teams</h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">Teams you're a member of across all hackathons.</p>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <EmptyState
            icon={<FiUsers />}
            title="No teams yet"
            description="Register for a hackathon and create or join a team from its details page."
            action={
              <Link to="/hackathons">
                <Button>Explore hackathons</Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {teams.map((team) => (
              <Card key={team._id} className="flex items-center justify-between p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{team.name}</p>
                    <Badge variant={statusVariant[team.status]} className="capitalize">
                      {team.status?.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">{team.hackathon?.title}</p>
                </div>
                <Link to={`/dashboard/participant/teams/${team._id}`}>
                  <Button variant="secondary" size="sm">
                    Manage
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

export default MyTeamsPage;
