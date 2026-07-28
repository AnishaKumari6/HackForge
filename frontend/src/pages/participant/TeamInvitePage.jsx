import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUsers, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { Card, PageSpinner } from "../../components/ui/Primitives";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import teamService from "../../services/teamService";

const TeamInvitePage = () => {
  const { token } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle"); // idle | accepting | declining | done | error
  const [message, setMessage] = useState("");

  // If user isn't logged in, redirect to login and come back
  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/teams/invite/${token}`, { replace: true });
    }
  }, [user, token, navigate]);

  const handleAccept = async () => {
    setStatus("accepting");
    try {
      await teamService.acceptInvite(token);
      toast.success("You joined the team!");
      setStatus("done");
      setMessage("accepted");
      setTimeout(() => navigate("/dashboard/participant/teams"), 2000);
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "This invitation is invalid or has already been used.");
    }
  };

  const handleDecline = async () => {
    setStatus("declining");
    try {
      await teamService.declineInvite(token);
      setStatus("done");
      setMessage("declined");
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Something went wrong.");
    }
  };

  if (!user) return <PageSpinner />;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        {status === "done" && message === "accepted" ? (
          <>
            <FiCheckCircle size={40} className="mx-auto text-success" />
            <h2 className="mt-4 font-display text-xl font-bold">Welcome to the team!</h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">Redirecting you to your teams dashboard…</p>
          </>
        ) : status === "done" && message === "declined" ? (
          <>
            <FiXCircle size={40} className="mx-auto text-[var(--ink-muted)]" />
            <h2 className="mt-4 font-display text-xl font-bold">Invitation declined</h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">You've declined this team invitation.</p>
            <Link to="/hackathons" className="mt-6 inline-block text-sm font-semibold text-volt-500 hover:underline">
              Explore hackathons
            </Link>
          </>
        ) : status === "error" ? (
          <>
            <FiXCircle size={40} className="mx-auto text-danger" />
            <h2 className="mt-4 font-display text-xl font-bold">Something went wrong</h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">{message}</p>
            <Link to="/dashboard" className="mt-6 inline-block text-sm font-semibold text-volt-500 hover:underline">
              Back to dashboard
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-forge">
              <FiUsers size={24} className="text-white" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold">You've been invited to join a team</h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Accept this invitation to join the team on HackForge.
            </p>
            <div className="mt-8 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                isLoading={status === "declining"}
                disabled={status === "accepting"}
                onClick={handleDecline}
              >
                Decline
              </Button>
              <Button
                className="flex-1"
                isLoading={status === "accepting"}
                disabled={status === "declining"}
                onClick={handleAccept}
              >
                Accept
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default TeamInvitePage;
