import { useEffect, useState } from "react";
import { FiBookmark } from "react-icons/fi";
import HackathonCard from "../../components/hackathon/HackathonCard";
import { Skeleton, EmptyState } from "../../components/ui/Primitives";
import { bookmarkService } from "../../services/miscServices";

const BookmarksPage = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookmarkService
      .getMine()
      .then(({ bookmarks }) => setHackathons(bookmarks.filter(Boolean)))
      .catch((err) => console.error("Failed to load bookmarks:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Bookmarked Hackathons</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">Events you've saved for later.</p>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        ) : hackathons.length === 0 ? (
          <EmptyState icon={<FiBookmark />} title="No bookmarks yet" description="Save hackathons you're interested in to find them here later." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hackathons.map((h, i) => (
              <HackathonCard key={h._id} hackathon={h} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;
