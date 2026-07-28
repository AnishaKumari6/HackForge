import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import HeroSection from "../../components/home/HeroSection";
import {
  CategoriesSection,
  StatsSection,
  TestimonialsSection,
  PartnersSection,
  FAQSection,
} from "../../components/home/HomeSections";
import HackathonCard from "../../components/hackathon/HackathonCard";
import { Skeleton, EmptyState } from "../../components/ui/Primitives";
import hackathonService from "../../services/hackathonService";

const CardGridSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-80 w-full" />
    ))}
  </div>
);

const HackathonSection = ({ title, subtitle, hackathons, loading, viewAllTo }) => (
  <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="mb-8 flex items-end justify-between">
      <div>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">{subtitle}</p>
      </div>
      <Link to={viewAllTo} className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-volt-500 hover:underline sm:flex">
        View all <FiArrowRight size={14} />
      </Link>
    </div>

    {loading ? (
      <CardGridSkeleton />
    ) : hackathons.length === 0 ? (
      <EmptyState title="Nothing here yet" description="Check back soon for new events." />
    ) : (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {hackathons.map((h, i) => (
          <HackathonCard key={h._id} hackathon={h} index={i} />
        ))}
      </div>
    )}
  </section>
);

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featuredRes, trendingRes, statsRes] = await Promise.all([
          hackathonService.getFeatured(),
          hackathonService.getTrending(),
          hackathonService.getPublicStats(),
        ]);
        setFeatured(featuredRes.hackathons);
        setTrending(trendingRes.hackathons);
        setStats(statsRes.stats);
      } catch (err) {
        // Public homepage should degrade gracefully even if the API is briefly unavailable
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <HeroSection />
      <HackathonSection
        title="Featured hackathons"
        subtitle="Hand-picked events worth your weekend."
        hackathons={featured}
        loading={loading}
        viewAllTo="/hackathons"
      />
      <StatsSection stats={stats} />
      <HackathonSection
        title="Trending now"
        subtitle="The most active hackathons on the platform right now."
        hackathons={trending}
        loading={loading}
        viewAllTo="/hackathons?sort=-registeredCount"
      />
      <CategoriesSection />
      <TestimonialsSection />
      <PartnersSection />
      <FAQSection />
    </div>
  );
};

export default HomePage;
