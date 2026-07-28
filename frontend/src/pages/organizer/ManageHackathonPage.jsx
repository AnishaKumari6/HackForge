import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiDownload, FiCheck, FiX, FiUpload, FiAward } from "react-icons/fi";
import { Card, PageSpinner, Badge, Skeleton, EmptyState } from "../../components/ui/Primitives";
import Button from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/Modal";
import hackathonService from "../../services/hackathonService";
import teamService from "../../services/teamService";
import registrationService from "../../services/registrationService";
import userService from "../../services/userService";
import { formatDate, getHackathonPhase, phaseLabel, phaseVariant } from "../../utils/formatters";

const tabs = ["Teams", "Registrations", "Judges", "Settings"];
const teamStatusVariant = { forming: "neutral", pending_approval: "warning", approved: "success", rejected: "danger" };

const ManageHackathonPage = () => {
  const { id } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [teams, setTeams] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [judges, setJudges] = useState([]);
  const [selectedJudgeIds, setSelectedJudgeIds] = useState([]);
  const [activeTab, setActiveTab] = useState("Teams");
  const [loading, setLoading] = useState(true);
  const [confirmPublishResults, setConfirmPublishResults] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const bannerInputRef = useRef(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [mineRes, teamsRes, regRes, judgesRes] = await Promise.all([
        hackathonService.getMyHackathons({ limit: 100 }),
        teamService.getTeamsForHackathon(id),
        registrationService.getForHackathon(id, { limit: 100 }),
        userService.listJudges(),
      ]);
      const found = mineRes.hackathons.find((h) => h._id === id);
      setHackathon(found || null);
      setTeams(teamsRes.teams);
      setRegistrations(regRes.registrations);
      setJudges(judgesRes.judges);
      setSelectedJudgeIds(found?.judges?.map((j) => j._id || j) || []);
    } catch (err) {
      console.error("Failed to load hackathon management data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApprove = async (teamId) => {
    setBusy(true);
    try {
      await teamService.approveTeam(teamId);
      toast.success("Team approved!");
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve.");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (teamId) => {
    setBusy(true);
    try {
      await teamService.rejectTeam(teamId, "Did not meet eligibility requirements");
      toast.success("Team rejected.");
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject.");
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    setBusy(true);
    try {
      await hackathonService.publish(id);
      toast.success("Hackathon published!");
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish.");
    } finally {
      setBusy(false);
    }
  };

  const handleAssignJudges = async () => {
    setBusy(true);
    try {
      await hackathonService.assignJudges(id, selectedJudgeIds);
      toast.success("Judges updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign judges.");
    } finally {
      setBusy(false);
    }
  };

  const handlePublishResults = async () => {
    setBusy(true);
    try {
      await hackathonService.publishResults(id);
      toast.success("Results published and participants notified!");
      setConfirmPublishResults(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish results.");
    } finally {
      setBusy(false);
    }
  };

  const toggleJudge = (judgeId) => {
    setSelectedJudgeIds((prev) => (prev.includes(judgeId) ? prev.filter((id2) => id2 !== judgeId) : [...prev, judgeId]));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const formData = new FormData();
      formData.append("banner", file);
      const { banner } = await hackathonService.updateBanner(id, formData);
      setHackathon((prev) => ({ ...prev, banner }));
      toast.success("Banner updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload banner.");
    } finally {
      setBannerUploading(false);
      e.target.value = "";
    }
  };

  if (loading) return <PageSpinner />;
  if (!hackathon) return <EmptyState title="Hackathon not found" />;

  const phase = getHackathonPhase(hackathon);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold">{hackathon.title}</h1>
            <Badge variant={hackathon.status === "draft" ? "neutral" : phaseVariant[phase]}>
              {hackathon.status === "draft" ? "Draft" : phaseLabel[phase]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            {formatDate(hackathon.startDate)} – {formatDate(hackathon.endDate)}
          </p>
        </div>
        <div className="flex gap-2">
          {hackathon.status === "draft" && (
            <Button onClick={handlePublish} isLoading={busy} icon={<FiUpload size={15} />}>
              Publish
            </Button>
          )}
          {hackathon.status === "ongoing" && !hackathon.resultsPublished && (
            <Button onClick={() => setConfirmPublishResults(true)} icon={<FiAward size={15} />}>
              Publish Results
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab ? "border-volt-500 text-volt-500" : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Teams" && (
        <div className="mt-6 flex flex-col gap-3">
          {teams.length === 0 ? (
            <EmptyState title="No teams yet" description="Teams will appear here once participants start registering." />
          ) : (
            teams.map((team) => (
              <Card key={team._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{team.name}</p>
                    <Badge variant={teamStatusVariant[team.status]} className="capitalize">
                      {team.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">
                    {team.members.map((m) => m.user.name).join(", ")}
                  </p>
                </div>
                {team.status === "pending_approval" && (
                  <div className="flex gap-2">
                    <Button size="sm" isLoading={busy} icon={<FiCheck size={14} />} onClick={() => handleApprove(team._id)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="danger" isLoading={busy} icon={<FiX size={14} />} onClick={() => handleReject(team._id)}>
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "Registrations" && (
        <div className="mt-6">
          <div className="mb-4 flex justify-end">
            <a href={registrationService.exportCSVUrl(id)} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm" icon={<FiDownload size={14} />}>
                Export CSV
              </Button>
            </a>
          </div>
          {registrations.length === 0 ? (
            <EmptyState title="No registrations yet" />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
              <table className="w-full text-sm">
                <thead className="bg-[var(--surface)] text-left text-xs uppercase text-[var(--ink-muted)]">
                  <tr>
                    <th className="px-4 py-3">Participant</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Checked In</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg._id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-3">{reg.participant?.name}</td>
                      <td className="px-4 py-3">{reg.team?.name}</td>
                      <td className="px-4 py-3 capitalize">{reg.status}</td>
                      <td className="px-4 py-3">{reg.checkedIn ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "Judges" && (
        <div className="mt-6">
          <Card className="p-6">
            <p className="mb-4 text-sm text-[var(--ink-muted)]">Select judges to assign to this hackathon.</p>
            <div className="flex flex-col gap-3">
              {judges.map((j) => (
                <label key={j._id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-[var(--border)]/30">
                  <input
                    type="checkbox"
                    checked={selectedJudgeIds.includes(j._id)}
                    onChange={() => toggleJudge(j._id)}
                    className="h-4 w-4 accent-[var(--color-volt-500)]"
                  />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-forge text-xs font-bold text-white">
                    {j.name[0]}
                  </div>
                  <span className="text-sm">{j.name}</span>
                </label>
              ))}
            </div>
            <Button className="mt-5" onClick={handleAssignJudges} isLoading={busy}>
              Save judges
            </Button>
          </Card>
        </div>
      )}

      {activeTab === "Settings" && (
        <div className="mt-6 flex flex-col gap-6">
          <Card className="p-6">
            <h2 className="mb-2 font-display text-lg font-bold">Event Details</h2>
            <p className="mb-4 text-sm text-[var(--ink-muted)]">
              Edit the title, description, timeline, prizes, rules, and judging criteria.
            </p>
            <Link to={`/dashboard/organizer/hackathons/${id}/edit`}>
              <Button variant="secondary">Edit details</Button>
            </Link>
          </Card>

          <Card className="p-6">
            <h2 className="mb-2 font-display text-lg font-bold">Banner Image</h2>
            <p className="mb-4 text-sm text-[var(--ink-muted)]">Shown at the top of the hackathon's public page.</p>
            {hackathon.banner?.url && (
              <img src={hackathon.banner.url} alt="" className="mb-4 h-32 w-full max-w-md rounded-xl object-cover" />
            )}
            <input ref={bannerInputRef} type="file" accept="image/*" hidden onChange={handleBannerUpload} />
            <Button variant="secondary" isLoading={bannerUploading} onClick={() => bannerInputRef.current?.click()}>
              {hackathon.banner?.url ? "Replace banner" : "Upload banner"}
            </Button>
          </Card>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmPublishResults}
        onClose={() => setConfirmPublishResults(false)}
        onConfirm={handlePublishResults}
        isLoading={busy}
        title="Publish results?"
        description="This locks in final rankings and emails every participant. This action cannot be undone."
        confirmLabel="Publish results"
      />
    </div>
  );
};

export default ManageHackathonPage;
