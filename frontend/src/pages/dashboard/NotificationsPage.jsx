import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiBell, FiCheck, FiTrash2 } from "react-icons/fi";
import { Card, Skeleton, EmptyState } from "../../components/ui/Primitives";
import Button from "../../components/ui/Button";
import { notificationService } from "../../services/miscServices";
import { formatDateTime } from "../../utils/formatters";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { notifications: data } = await notificationService.getMine({ limit: 50 });
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markOneRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  const removeOne = async (id) => {
    await notificationService.remove(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">Stay on top of team invites, approvals, and results.</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="secondary" size="sm" onClick={markAllRead} icon={<FiCheck size={14} />}>
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={<FiBell />} title="No notifications yet" description="You're all caught up." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {notifications.map((n) => (
            <Card
              key={n._id}
              className={`flex items-start gap-3 p-4 ${!n.isRead ? "border-volt-500/40 bg-volt-500/5" : ""}`}
            >
              <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!n.isRead ? "bg-volt-500" : "bg-transparent"}`} />
              <div className="min-w-0 flex-1">
                <Link to={n.link || "#"} onClick={() => !n.isRead && markOneRead(n._id)} className="block">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="mt-0.5 text-sm text-[var(--ink-muted)]">{n.message}</p>
                  <p className="mt-1.5 text-xs text-[var(--ink-muted)]">{formatDateTime(n.createdAt)}</p>
                </Link>
              </div>
              <button
                onClick={() => removeOne(n._id)}
                className="shrink-0 rounded-lg p-1.5 text-[var(--ink-muted)] hover:bg-danger/10 hover:text-danger"
              >
                <FiTrash2 size={14} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
