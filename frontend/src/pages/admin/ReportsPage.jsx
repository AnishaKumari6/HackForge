import { useEffect, useState } from "react";
import { Card, Skeleton } from "../../components/ui/Primitives";
import { adminService } from "../../services/miscServices";

const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getReports()
      .then(({ report: data }) => setReport(data))
      .catch((err) => console.error("Failed to load reports:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Platform Reports</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">Top-performing hackathons and organizers.</p>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Top Hackathons by Registrations</h2>
            <div className="flex flex-col gap-3">
              {report?.topHackathonsByRegistrations.map((h, i) => (
                <div key={h._id} className="flex items-center justify-between border-b border-[var(--border)] pb-2.5 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--border)] text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{h.title}</span>
                  </div>
                  <span className="text-sm font-semibold text-volt-500">{h.registeredCount}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Top Organizers</h2>
            <div className="flex flex-col gap-3">
              {report?.topOrganizers.map((o, i) => (
                <div key={i} className="flex items-center justify-between border-b border-[var(--border)] pb-2.5 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{o.organizer.name}</p>
                    <p className="text-xs text-[var(--ink-muted)]">{o.organizer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-volt-500">{o.hackathonsCreated} events</p>
                    <p className="text-xs text-[var(--ink-muted)]">{o.totalRegistrations} registrations</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
