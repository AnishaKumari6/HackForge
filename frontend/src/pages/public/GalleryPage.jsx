import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiGithub, FiExternalLink } from "react-icons/fi";
import { Card, Skeleton, EmptyState, Badge } from "../../components/ui/Primitives";
import Input from "../../components/ui/Input";
import submissionService from "../../services/submissionService";

const GalleryPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      submissionService
        .getGallery({ search, limit: 24 })
        .then((res) => setSubmissions(res?.submissions || []))
        .catch((err) => console.error("Failed to load gallery:", err))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Project Gallery</h1>
        <p className="mt-2 text-[var(--ink-muted)]">Real projects, shipped by real teams under real deadlines.</p>
      </div>

      <Input
        placeholder="Search projects by name, tech stack..."
        icon={<FiSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        containerClassName="mb-8 max-w-md"
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : !submissions || submissions.length === 0 ? (
        <EmptyState title="No projects found" description="Try a different search term." />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {submissions.map((sub) => (
            <Card key={sub._id} hover className="flex flex-col overflow-hidden">
              <div className="flex h-32 items-center justify-center bg-gradient-forge">
                {sub.images?.[0]?.url ? (
                  <img src={sub.images[0].url} alt={sub.projectName} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-xl font-bold text-white/90">{sub.projectName?.[0]}</span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs text-[var(--ink-muted)]">{sub.hackathon?.title}</p>
                <h3 className="mt-1 font-display text-lg font-bold">{sub.projectName}</h3>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">by {sub.team?.name}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {sub.techStack?.slice(0, 3).map((t) => (
                    <Badge key={t} variant="neutral">
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex gap-3 border-t border-[var(--border)] pt-3.5">
                  {sub.githubLink && (
                    <a
                      href={sub.githubLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-muted)] hover:text-volt-500"
                    >
                      <FiGithub size={13} /> Code
                    </a>
                  )}
                  {sub.demoLink && (
                    <a
                      href={sub.demoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-muted)] hover:text-volt-500"
                    >
                      <FiExternalLink size={13} /> Demo
                    </a>
                  )}
                  <Link
                    to={`/hackathons/${sub.hackathon?.slug}`}
                    className="ml-auto text-xs font-semibold text-volt-500 hover:underline"
                  >
                    View event →
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
