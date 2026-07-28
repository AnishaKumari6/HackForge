import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiGithub, FiExternalLink, FiFileText, FiVideo } from "react-icons/fi";
import { Card, PageSpinner } from "../../components/ui/Primitives";
import { Textarea } from "../../components/ui/FormFields";
import Button from "../../components/ui/Button";
import submissionService from "../../services/submissionService";
import reviewService from "../../services/reviewService";

const criteria = [
  { key: "innovation", label: "Innovation" },
  { key: "technicalComplexity", label: "Technical Complexity" },
  { key: "ui", label: "UI" },
  { key: "ux", label: "UX" },
  { key: "scalability", label: "Scalability" },
  { key: "documentation", label: "Documentation" },
  { key: "presentation", label: "Presentation" },
];

const ScoreSlider = ({ label, value, onChange }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between text-sm">
      <span className="font-medium">{label}</span>
      <span className="font-mono font-bold text-volt-500">{value}/10</span>
    </div>
    <input
      type="range"
      min="0"
      max="10"
      step="0.5"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-[var(--color-volt-500)]"
    />
  </div>
);

const ScoringPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [scores, setScores] = useState(Object.fromEntries(criteria.map((c) => [c.key, 5])));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue } = useForm({ defaultValues: { comments: "" } });

  useEffect(() => {
    Promise.all([submissionService.getSubmission(submissionId), reviewService.getMyReviewForSubmission(submissionId)])
      .then(([subRes, reviewRes]) => {
        setSubmission(subRes.submission);
        if (reviewRes.review) {
          setScores(reviewRes.review.scores);
          setValue("comments", reviewRes.review.comments);
        }
      })
      .catch((err) => console.error("Failed to load submission:", err))
      .finally(() => setLoading(false));
  }, [submissionId, setValue]);

  const onSubmit = async ({ comments }) => {
    setSubmitting(true);
    try {
      await reviewService.submitReview(submissionId, { scores, comments });
      toast.success("Evaluation submitted!");
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit evaluation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (!submission) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold">{submission.projectName}</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">Team: {submission.team?.name}</p>

      <Card className="mt-6 p-6">
        <h2 className="mb-3 font-display text-lg font-bold">Project Details</h2>
        <div className="flex flex-col gap-4 text-sm">
          <div>
            <p className="mb-1 font-semibold text-[var(--ink-muted)]">Description</p>
            <p>{submission.description}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--border)] pt-4 text-sm">
          {submission.githubLink && (
            <a href={submission.githubLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-volt-500 hover:underline">
              <FiGithub size={14} /> GitHub
            </a>
          )}
          {submission.demoLink && (
            <a href={submission.demoLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-volt-500 hover:underline">
              <FiExternalLink size={14} /> Live Demo
            </a>
          )}
          {submission.presentationPdf?.url && (
            <a href={submission.presentationPdf.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-volt-500 hover:underline">
              <FiFileText size={14} /> Presentation
            </a>
          )}
          {submission.demoVideo?.url && (
            <a href={submission.demoVideo.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-volt-500 hover:underline">
              <FiVideo size={14} /> Demo Video
            </a>
          )}
        </div>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mt-6 p-6">
          <h2 className="mb-5 font-display text-lg font-bold">Scoring</h2>
          <div className="flex flex-col gap-5">
            {criteria.map((c) => (
              <ScoreSlider
                key={c.key}
                label={c.label}
                value={scores[c.key]}
                onChange={(v) => setScores((prev) => ({ ...prev, [c.key]: v }))}
              />
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-volt-500/10 px-4 py-3 text-center">
            <p className="text-xs text-[var(--ink-muted)]">Overall Score</p>
            <p className="font-mono text-2xl font-bold text-gradient-forge">
              {(Object.values(scores).reduce((s, v) => s + v, 0) / criteria.length).toFixed(2)}/10
            </p>
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <Textarea label="Feedback for the team" rows={4} placeholder="Share constructive feedback..." {...register("comments")} />
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Link to="/dashboard/judge/assigned">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={submitting}>
            Submit Evaluation
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ScoringPage;
