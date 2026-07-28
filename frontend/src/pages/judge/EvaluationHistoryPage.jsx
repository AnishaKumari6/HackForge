import { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";
import { Card, Skeleton, EmptyState } from "../../components/ui/Primitives";
import reviewService from "../../services/reviewService";
import { formatDateTime } from "../../utils/formatters";

const EvaluationHistoryPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewService
      .getHistory()
      .then(({ reviews: data }) => setReviews(data))
      .catch((err) => console.error("Failed to load history:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Evaluation History</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">Every project you've reviewed across all hackathons.</p>

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState icon={<FiClock />} title="No evaluations yet" />
        ) : (
          <div className="flex flex-col gap-2.5">
            {reviews.map((r) => (
              <Card key={r._id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold">{r.submission?.projectName}</p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {r.hackathon?.title} · {formatDateTime(r.createdAt)}
                  </p>
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

export default EvaluationHistoryPage;
