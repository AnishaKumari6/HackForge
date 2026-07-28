import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiMail, FiLogOut, FiTrash2, FiSend, FiAward, FiFileText } from "react-icons/fi";
import { Card, PageSpinner, Badge, EmptyState } from "../../components/ui/Primitives";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import teamService from "../../services/teamService";

const statusVariant = { forming: "neutral", pending_approval: "warning", approved: "success", rejected: "danger" };

const TeamDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null); // "leave" | "delete" | "submit"
  const [actionLoading, setActionLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const load = () => {
    setLoading(true);
    teamService
      .getTeam(id)
      .then(({ team: data }) => setTeam(data))
      .catch((err) => console.error("Failed to load team:", err))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const isLeader = team?.members?.find((m) => m.user._id === user.id)?.role === "leader";

  const handleInvite = async ({ email }) => {
    try {
      await teamService.inviteMember(id, email);
      toast.success(`Invitation sent to ${email}`);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send invite.");
    }
  };

  const runAction = async (fn, successMsg) => {
    setActionLoading(true);
    try {
      await fn();
      toast.success(successMsg);
      setConfirmAction(null);
      if (confirmAction === "leave" || confirmAction === "delete") {
        navigate("/dashboard/participant/teams");
      } else {
        load();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (!team) return <EmptyState title="Team not found" />;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold">{team.name}</h1>
            <Badge variant={statusVariant[team.status]} className="capitalize">
              {team.status?.replace("_", " ")}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">{team.hackathon?.title}</p>
        </div>
      </div>

      {team.status === "rejected" && team.rejectionReason && (
        <div className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          <strong>Not approved:</strong> {team.rejectionReason}
        </div>
      )}

      <Card className="mt-6 p-6">
        <h2 className="mb-4 font-display text-lg font-bold">Members ({team.members.length}/{team.hackathon?.maxTeamSize})</h2>
        <div className="flex flex-col gap-3">
          {team.members.map((m) => (
            <div key={m.user._id} className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-forge text-xs font-bold text-white">
                {m.user.name?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{m.user.name}</p>
                <p className="truncate text-xs text-[var(--ink-muted)]">{m.user.email}</p>
              </div>
              {m.role === "leader" && (
                <Badge variant="ember">
                  <FiAward size={11} /> Leader
                </Badge>
              )}
            </div>
          ))}
        </div>

        {isLeader && team.status === "forming" && (
          <form onSubmit={handleSubmit(handleInvite)} className="mt-5 flex gap-2 border-t border-[var(--border)] pt-5">
            <Input
              placeholder="teammate@example.com"
              icon={<FiMail size={15} />}
              error={errors.email?.message}
              containerClassName="flex-1"
              {...register("email", { required: "Email is required" })}
            />
            <Button type="submit" isLoading={isSubmitting} icon={<FiSend size={14} />}>
              Invite
            </Button>
          </form>
        )}
      </Card>

      {team.status === "approved" && (
        <Card className="mt-6 flex items-center justify-between p-6">
          <div>
            <h2 className="font-display text-lg font-bold">Project Submission</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">Your team is approved — submit your project when ready.</p>
          </div>
          <Link to={`/dashboard/participant/submissions/${team.hackathon._id}?team=${team._id}`}>
            <Button icon={<FiFileText size={15} />}>Go to submission</Button>
          </Link>
        </Card>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {isLeader && team.status === "forming" && (
          <Button onClick={() => setConfirmAction("submit")}>Submit for approval</Button>
        )}
        <Button variant="secondary" icon={<FiLogOut size={15} />} onClick={() => setConfirmAction("leave")}>
          Leave team
        </Button>
        {isLeader && (
          <Button variant="danger" icon={<FiTrash2 size={15} />} onClick={() => setConfirmAction("delete")}>
            Delete team
          </Button>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        isLoading={actionLoading}
        title={
          confirmAction === "leave" ? "Leave this team?" : confirmAction === "delete" ? "Delete this team?" : "Submit for approval?"
        }
        description={
          confirmAction === "leave"
            ? "You'll be removed from this team. The leader must transfer leadership before leaving if others remain."
            : confirmAction === "delete"
            ? "This permanently deletes the team and any pending registrations. This cannot be undone."
            : "Your team will be locked and sent to the organizer for approval. You won't be able to add more members until reviewed."
        }
        confirmLabel={confirmAction === "leave" ? "Leave team" : confirmAction === "delete" ? "Delete team" : "Submit"}
        variant={confirmAction === "delete" ? "danger" : "primary"}
        onConfirm={() => {
          if (confirmAction === "leave") runAction(() => teamService.leaveTeam(id), "You left the team.");
          else if (confirmAction === "delete") runAction(() => teamService.deleteTeam(id), "Team deleted.");
          else runAction(() => teamService.submitForApproval(id), "Submitted for approval!");
        }}
      />
    </div>
  );
};

export default TeamDetailPage;
