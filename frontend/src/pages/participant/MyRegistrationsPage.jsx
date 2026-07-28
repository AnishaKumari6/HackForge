import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiCheckSquare, FiExternalLink, FiXCircle } from "react-icons/fi";
import { Card, Skeleton, EmptyState, Badge } from "../../components/ui/Primitives";
import { ConfirmDialog } from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import registrationService from "../../services/registrationService";
import { formatDate } from "../../utils/formatters";

const statusVariant = { pending: "warning", approved: "success", rejected: "danger", cancelled: "neutral" };

const MyRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    setLoading(true);
    registrationService
      .getMyRegistrations()
      .then(({ registrations: data }) => setRegistrations(data))
      .catch((err) => console.error("Failed to load registrations:", err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await registrationService.cancel(cancelTarget._id);
      toast.success("Registration cancelled.");
      setCancelTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">My Registrations</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">Every hackathon you've registered for, in one place.</p>

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <EmptyState
            icon={<FiCheckSquare />}
            title="No registrations yet"
            description="Browse hackathons and register with your team to get started."
            action={
              <Link to="/hackathons">
                <Button>Explore hackathons</Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {registrations.map((reg) => (
              <Card key={reg._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{reg.hackathon?.title}</p>
                    <Badge variant={statusVariant[reg.status]} className="capitalize">
                      {reg.status}
                    </Badge>
                    {reg.checkedIn && <Badge variant="volt">Checked in</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">
                    Team: {reg.team?.name} · {formatDate(reg.hackathon?.startDate)} – {formatDate(reg.hackathon?.endDate)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link to={`/hackathons/${reg.hackathon?.slug}`}>
                    <Button variant="secondary" size="sm" icon={<FiExternalLink size={14} />}>
                      View event
                    </Button>
                  </Link>
                  {reg.status === "approved" && (
                    <Button variant="ghost" size="sm" onClick={() => setCancelTarget(reg)} icon={<FiXCircle size={14} />}>
                      Cancel
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        isLoading={cancelling}
        title="Cancel registration?"
        description={`This will cancel your registration for "${cancelTarget?.hackathon?.title}". This cannot be undone.`}
        confirmLabel="Cancel registration"
      />
    </div>
  );
};

export default MyRegistrationsPage;
