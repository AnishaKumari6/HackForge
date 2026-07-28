import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiClipboard, FiCheckCircle, FiClock } from "react-icons/fi";
import { Card, Skeleton, EmptyState } from "../../components/ui/Primitives";
import reviewService from "../../services/reviewService";

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

const JudgeOverview = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewService
      .getHistory()
      .then(({ reviews }) => setHistory(reviews))
      .catch((err) => console.error("Failed to load review history:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Judge Dashboard</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">Review your assigned projects and track your evaluation history.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={FiCheckCircle} label="Projects reviewed" value={history.length} />
        <StatCard
          icon={FiClock}
          label="Avg score given"
          value={history.length ? (history.reduce((s, r) => s + r.totalScore, 0) / history.length).toFixed(1) : "—"}
        />
      </div>

      <div className="mt-10 flex items-end justify-between">
        <h2 className="font-display text-lg font-bold">Recent evaluations</h2>
        <Link to="/dashboard/judge/history" className="text-sm font-semibold text-volt-500 hover:underline">
          View all
        </Link>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <EmptyState icon={<FiClipboard />} title="No evaluations yet" description="Assigned projects will appear once organizers add you as a judge." />
        ) : (
          <div className="flex flex-col gap-2.5">
            {history.slice(0, 5).map((r) => (
              <Card key={r._id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold">{r.submission?.projectName}</p>
                  <p className="text-xs text-[var(--ink-muted)]">{r.hackathon?.title}</p>
                </div>
                <span className="font-mono font-bold text-gradient-forge">{r.totalScore.toFixed(1)}</span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgeOverview;
