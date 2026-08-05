import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiClipboard } from "react-icons/fi";
import { Card, Skeleton, EmptyState, Badge } from "../../components/ui/Primitives";
import { Select } from "../../components/ui/FormFields";
import hackathonService from "../../services/hackathonService";
import reviewService from "../../services/reviewService";
import { useAuth } from "../../context/AuthContext";

const AssignedProjectsPage = () => {
  const { user } = useAuth();
  const [myHackathons, setMyHackathons] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [projects, setProjects] = useState([]);
  const [loadingHackathons, setLoadingHackathons] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    hackathonService
      .getHackathons({ limit: 50 })
      .then((res) => {
        const hackathons = res?.hackathons || [];
        const assigned = hackathons.filter((h) => h.judges?.some((j) => (j._id || j) === user.id));
        setMyHackathons(assigned);
        if (assigned.length) setSelectedId(assigned[0]._id);
      })
      .catch((err) => console.error("Failed to load assigned hackathons:", err))
      .finally(() => setLoadingHackathons(false));
  }, [user.id]);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingProjects(true);
    reviewService
      .getAssignedProjects(selectedId)
      .then((res) => setProjects(res?.projects || []))
      .catch((err) => console.error("Failed to load projects:", err))
      .finally(() => setLoadingProjects(false));
  }, [selectedId]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Assigned Projects</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">Review and score submitted projects for your assigned hackathons.</p>

      {loadingHackathons ? (
        <Skeleton className="mt-6 h-12 w-64" />
      ) : !myHackathons || myHackathons.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={<FiClipboard />} title="No assignments yet" description="You haven't been assigned to judge any hackathon." />
        </div>
      ) : (
        <>
          <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} containerClassName="mt-6 max-w-sm">
            {myHackathons.map((h) => (
              <option key={h._id} value={h._id}>
                {h.title}
              </option>
            ))}
          </Select>

          <div className="mt-6">
            {loadingProjects ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : !projects || projects.length === 0 ? (
              <EmptyState title="No submitted projects yet" description="Check back once teams start submitting." />
            ) : (
              <div className="flex flex-col gap-3">
                {projects.map((p) => (
                  <Card key={p._id} className="flex items-center justify-between p-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{p.projectName}</p>
                        {p.reviewedByMe && (
                          <Badge variant="success">
                            <FiCheckCircle size={11} /> Reviewed
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[var(--ink-muted)]">Team: {p.team?.name}</p>
                    </div>
                    <Link
                      to={`/dashboard/judge/score/${p._id}`}
                      className="rounded-xl bg-volt-500 hover:bg-volt-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200"
                    >
                      {p.reviewedByMe ? "Edit Review" : "Review"}
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AssignedProjectsPage;
