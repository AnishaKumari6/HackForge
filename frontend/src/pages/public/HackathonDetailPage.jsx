import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiMapPin,
  FiUsers,
  FiCalendar,
  FiBookmark,
  FiCheckCircle,
  FiAward,
} from "react-icons/fi";
import { PageSpinner, Badge, Card, EmptyState } from "../../components/ui/Primitives";
import Button from "../../components/ui/Button";
import CountdownTimer from "../../components/hackathon/CountdownTimer";
import hackathonService from "../../services/hackathonService";
import teamService from "../../services/teamService";
import reviewService from "../../services/reviewService";
import { bookmarkService } from "../../services/miscServices";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency, formatDate, getHackathonPhase, phaseLabel, phaseVariant } from "../../utils/formatters";

const tabs = ["Overview", "Timeline", "Rules & Judging", "Leaderboard"];

const HackathonDetailPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [myTeam, setMyTeam] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { hackathon: h } = await hackathonService.getBySlug(slug);
        setHackathon(h);

        if (user?.role === "participant") {
          const { team } = await teamService.getMyTeamForHackathon(h._id);
          setMyTeam(team);
        }

        const { leaderboard: lb } = await reviewService.getLeaderboard(h._id);
        setLeaderboard(lb);
      } catch (err) {
        console.error("Failed to load hackathon:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, user]);

  const handleBookmark = async () => {
    if (!user) return navigate("/login");
    try {
      const { bookmarked: isNowBookmarked } = await bookmarkService.toggle(hackathon._id);
      setBookmarked(isNowBookmarked);
      toast.success(isNowBookmarked ? "Bookmarked!" : "Removed from bookmarks");
    } catch (err) {
      toast.error("Something went wrong.");
    }
  };

  if (loading) return <PageSpinner />;
  if (!hackathon)
    return (
      <div className="mx-auto max-w-3xl px-4 py-24">
        <EmptyState title="Hackathon not found" description="This event may have been removed or the link is incorrect." />
      </div>
    );

  const phase = getHackathonPhase(hackathon);

  return (
    <div>
      <div className="relative h-64 w-full overflow-hidden bg-gradient-forge sm:h-80">
        {hackathon.banner?.url && (
          <img src={hackathon.banner.url} alt={hackathon.title} className="h-full w-full object-cover opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative -mt-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge variant={phaseVariant[phase]} dot className="mb-3">
                {phaseLabel[phase]}
              </Badge>
              <h1 className="font-display text-3xl font-bold sm:text-4xl">{hackathon.title}</h1>
              <p className="mt-2 max-w-2xl text-[var(--ink-muted)]">{hackathon.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--ink-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <FiCalendar size={14} /> {formatDate(hackathon.startDate)} – {formatDate(hackathon.endDate)}
                </span>
                {hackathon.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <FiMapPin size={14} /> {hackathon.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <FiUsers size={14} /> {hackathon.registeredCount} registered
                </span>
                <span className="inline-flex items-center gap-1.5 capitalize">
                  <FiAward size={14} /> {hackathon.organizer?.name}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button
                variant="secondary"
                onClick={handleBookmark}
                icon={<FiBookmark size={16} fill={bookmarked ? "currentColor" : "none"} />}
              >
                {bookmarked ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? "border-volt-500 text-volt-500"
                      : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "Overview" && (
              <div className="max-w-none text-[var(--ink)]">
                <p className="whitespace-pre-line leading-relaxed text-[var(--ink)]">{hackathon.description}</p>
                {hackathon.themes?.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {hackathon.themes.map((theme) => (
                      <Badge key={theme} variant="volt">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Timeline" && (
              <div className="flex flex-col gap-6">
                {hackathon.timeline?.length > 0 ? (
                  hackathon.timeline.map((event, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 shrink-0 rounded-full bg-gradient-forge" />
                        {i < hackathon.timeline.length - 1 && <div className="w-px flex-1 bg-[var(--border)]" />}
                      </div>
                      <div className="pb-6">
                        <p className="text-xs text-[var(--ink-muted)]">{formatDate(event.date)}</p>
                        <p className="font-semibold">{event.title}</p>
                        {event.description && <p className="mt-1 text-sm text-[var(--ink-muted)]">{event.description}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--ink-muted)]">No timeline published yet.</p>
                )}
              </div>
            )}

            {activeTab === "Rules & Judging" && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="mb-3 font-display text-lg font-bold">Rules</h3>
                  <ul className="flex flex-col gap-2">
                    {hackathon.rules?.map((rule, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <FiCheckCircle size={16} className="mt-0.5 shrink-0 text-success" /> {rule}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 font-display text-lg font-bold">Judging Criteria</h3>
                  <div className="flex flex-col gap-2">
                    {hackathon.judgingCriteria?.map((c) => (
                      <div key={c.name} className="flex items-center gap-3">
                        <span className="w-40 shrink-0 text-sm">{c.name}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
                          <div className="h-full bg-gradient-forge" style={{ width: `${c.weight}%` }} />
                        </div>
                        <span className="w-10 text-right text-xs text-[var(--ink-muted)]">{c.weight}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Leaderboard" && (
              <div className="flex flex-col gap-2">
                {leaderboard.length === 0 ? (
                  <EmptyState title="No results yet" description="The leaderboard will populate once judging begins." />
                ) : (
                  leaderboard.map((entry) => (
                    <Card key={entry.submissionId} className="flex items-center gap-4 p-4">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${
                          entry.rank <= 3 ? "bg-gradient-forge text-white" : "bg-[var(--border)] text-[var(--ink-muted)]"
                        }`}
                      >
                        {entry.rank}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{entry.project}</p>
                        <p className="truncate text-xs text-[var(--ink-muted)]">{entry.team}</p>
                      </div>
                      <span className="font-mono font-bold text-gradient-forge">{entry.score.toFixed(1)}</span>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <Card className="p-5">
              <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">Prize Pool</p>
              <p className="mt-1 font-display text-3xl font-bold text-gradient-forge">
                {hackathon.prizePool ? formatCurrency(hackathon.prizePool) : "TBD"}
              </p>
              {hackathon.prizeBreakdown?.length > 0 && (
                <div className="mt-4 flex flex-col gap-2 border-t border-[var(--border)] pt-4">
                  {hackathon.prizeBreakdown.map((p) => (
                    <div key={p.position} className="flex justify-between text-sm">
                      <span className="text-[var(--ink-muted)]">{p.position}</span>
                      <span className="font-semibold">{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {phase === "registration_open" && (
              <Card className="p-5">
                <CountdownTimer targetDate={hackathon.registrationEnd} label="Registration closes in" />
              </Card>
            )}
            {phase === "upcoming" && (
              <Card className="p-5">
                <CountdownTimer targetDate={hackathon.startDate} label="Hackathon starts in" />
              </Card>
            )}

            <Card className="p-5">
              <p className="mb-3 text-xs uppercase tracking-wide text-[var(--ink-muted)]">Team Size</p>
              <p className="text-sm">
                {hackathon.minTeamSize === hackathon.maxTeamSize
                  ? `Exactly ${hackathon.minTeamSize} member(s)`
                  : `${hackathon.minTeamSize} – ${hackathon.maxTeamSize} members`}
              </p>

              <div className="mt-5">
                {!user ? (
                  <Button
                    className="w-full"
                    onClick={() => navigate("/login", { state: { from: { pathname: `/hackathons/${slug}` } } })}
                  >
                    Log in to register
                  </Button>
                ) : user.role !== "participant" ? (
                  <p className="text-xs text-[var(--ink-muted)]">Only participant accounts can register for hackathons.</p>
                ) : myTeam ? (
                  <Link to={`/dashboard/participant/teams/${myTeam._id}`}>
                    <Button variant="secondary" className="w-full">
                      View my team ({myTeam.status.replace("_", " ")})
                    </Button>
                  </Link>
                ) : phase === "registration_open" ? (
                  <Link to={`/dashboard/participant/teams/create?hackathon=${hackathon._id}`}>
                    <Button className="w-full">Create / Join a team</Button>
                  </Link>
                ) : (
                  <p className="text-xs text-[var(--ink-muted)]">Registration is not currently open.</p>
                )}
              </div>
            </Card>

            {hackathon.judges?.length > 0 && (
              <Card className="p-5">
                <p className="mb-3 text-xs uppercase tracking-wide text-[var(--ink-muted)]">Judges</p>
                <div className="flex flex-col gap-3">
                  {hackathon.judges.map((j) => (
                    <div key={j._id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-forge text-xs font-bold text-white">
                        {j.name?.[0]}
                      </div>
                      <span className="text-sm">{j.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonDetailPage;
