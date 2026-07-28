import { useEffect, useState } from "react";
import { FiActivity } from "react-icons/fi";
import { Card, Skeleton, EmptyState, Badge } from "../../components/ui/Primitives";
import Button from "../../components/ui/Button";
import { adminService } from "../../services/miscServices";
import { formatDateTime } from "../../utils/formatters";

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminService
      .getActivityLogs({ page, limit: 20 })
      .then(({ logs: data, meta: m }) => {
        setLogs(data);
        setMeta(m);
      })
      .catch((err) => console.error("Failed to load activity logs:", err))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Activity Logs</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">A full audit trail of sensitive admin and organizer actions.</p>

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState icon={<FiActivity />} title="No activity logged yet" />
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {logs.map((log) => (
                <Card key={log._id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="volt">{log.action}</Badge>
                      <p className="truncate text-sm">{log.description}</p>
                    </div>
                    <p className="mt-1 text-xs text-[var(--ink-muted)]">
                      {log.actor?.name} ({log.actor?.role}) · {formatDateTime(log.createdAt)}
                    </p>
                  </div>
                </Card>
              ))}
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

export default ActivityLogsPage;
