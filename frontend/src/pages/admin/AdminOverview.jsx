import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FiUsers, FiCalendar, FiCheckSquare, FiFileText, FiSlash } from "react-icons/fi";
import { Card, Skeleton } from "../../components/ui/Primitives";
import { adminService } from "../../services/miscServices";
import { formatDateTime } from "../../utils/formatters";

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

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [growth, setGrowth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminService.getDashboard(), adminService.getMonthlyGrowth()])
      .then(([dashRes, growthRes]) => {
        setStats(dashRes.stats);
        setRecentActivity(dashRes.recentActivity);
        setGrowth(growthRes.growth);
      })
      .catch((err) => console.error("Failed to load admin dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const chartData = growth?.users.map((u, i) => ({
    label: u.label,
    Users: u.count,
    Hackathons: growth.hackathons[i]?.count || 0,
    Registrations: growth.registrations[i]?.count || 0,
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Admin Overview</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">Platform-wide statistics and recent activity.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FiUsers} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={FiCalendar} label="Total Hackathons" value={stats.totalHackathons} />
        <StatCard icon={FiCheckSquare} label="Registrations" value={stats.totalRegistrations} />
        <StatCard icon={FiSlash} label="Blocked Users" value={stats.blockedUsers} />
      </div>

      <Card className="mt-8 p-6">
        <h2 className="mb-5 font-display text-lg font-bold">Monthly Growth</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" stroke="var(--ink-muted)" fontSize={12} />
              <YAxis stroke="var(--ink-muted)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 13 }}
              />
              <Line type="monotone" dataKey="Users" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Hackathons" stroke="#2563eb" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Registrations" stroke="#10b981" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Users by Role</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(stats.usersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm capitalize">{role}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
                  <div className="h-full bg-gradient-forge" style={{ width: `${(count / stats.totalUsers) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-xs text-[var(--ink-muted)]">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Recent Activity</h2>
          <div className="flex flex-col gap-3">
            {recentActivity.slice(0, 6).map((log) => (
              <div key={log._id} className="border-b border-[var(--border)] pb-2.5 last:border-0">
                <p className="text-sm">
                  <span className="font-semibold">{log.actor?.name}</span> {log.description}
                </p>
                <p className="text-xs text-[var(--ink-muted)]">{formatDateTime(log.createdAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
