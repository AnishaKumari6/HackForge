import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiStar, FiTrash2, FiExternalLink } from "react-icons/fi";
import { Card, Skeleton, EmptyState, Badge } from "../../components/ui/Primitives";
import Button from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/Modal";
import hackathonService from "../../services/hackathonService";
import { formatDate } from "../../utils/formatters";

const ManageHackathonsAdminPage = () => {
  const [hackathons, setHackathons] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    hackathonService
      .getHackathons({ page, limit: 12, sort: "-createdAt" })
      .then((res) => {
        setHackathons(res?.hackathons || []);
        setMeta(res?.meta || null);
      })
      .catch((err) => console.error("Failed to load hackathons:", err))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const toggleFeatured = async (id) => {
    try {
      await hackathonService.toggleFeatured(id);
      load();
    } catch (err) {
      toast.error("Failed to update.");
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await hackathonService.remove(deleteTarget._id);
      toast.success("Hackathon deleted.");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Manage Hackathons</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">{meta?.total ?? "…"} hackathons across the platform.</p>

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !hackathons || hackathons.length === 0 ? (
          <EmptyState title="No hackathons found" />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {hackathons.map((h) => (
                <Card key={h._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{h.title}</p>
                      {h.isFeatured && <Badge variant="ember">Featured</Badge>}
                      <Badge variant="neutral" className="capitalize">
                        {h.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-[var(--ink-muted)]">
                      by {h.organizer?.name} · {formatDate(h.startDate)} · {h.registeredCount} registered
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" icon={<FiStar size={13} />} onClick={() => toggleFeatured(h._id)}>
                      {h.isFeatured ? "Unfeature" : "Feature"}
                    </Button>
                    <Link to={`/hackathons/${h.slug}`} target="_blank">
                      <Button size="sm" variant="secondary" icon={<FiExternalLink size={13} />}>
                        View
                      </Button>
                    </Link>
                    <Button size="sm" variant="danger" icon={<FiTrash2 size={13} />} onClick={() => setDeleteTarget(h)}>
                      Delete
                    </Button>
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

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={busy}
        title="Delete this hackathon?"
        description={`This permanently deletes "${deleteTarget?.title}" along with all its teams, registrations, and submissions.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ManageHackathonsAdminPage;
