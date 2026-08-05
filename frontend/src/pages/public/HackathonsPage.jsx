import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import HackathonCard from "../../components/hackathon/HackathonCard";
import { Skeleton, EmptyState } from "../../components/ui/Primitives";
import Input from "../../components/ui/Input";
import { Select } from "../../components/ui/FormFields";
import Button from "../../components/ui/Button";
import hackathonService from "../../services/hackathonService";

const filterDefaults = { search: "", mode: "", registrationOpen: "", sort: "-createdAt" };

const HackathonsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({ ...filterDefaults, ...Object.fromEntries(searchParams) });
  const [hackathons, setHackathons] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchHackathons = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9, sort: filters.sort };
      if (filters.search) params.search = filters.search;
      if (filters.mode) params.mode = filters.mode;
      if (filters.registrationOpen) params.registrationOpen = filters.registrationOpen;

      const res = await hackathonService.getHackathons(params);
      setHackathons(res?.hackathons || []);
      setMeta(res?.meta || null);
    } catch (err) {
      console.error("Failed to load hackathons:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons]);

  const applyFilter = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };

  const clearFilters = () => {
    setFilters(filterDefaults);
    setSearchParams({});
    setPage(1);
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== "sort" && v).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Explore Hackathons</h1>
        <p className="mt-2 text-[var(--ink-muted)]">Find your next challenge from {meta?.total ?? "…"} events.</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search hackathons by name, theme, tech..."
          icon={<FiSearch size={16} />}
          value={filters.search}
          onChange={(e) => applyFilter("search", e.target.value)}
          containerClassName="flex-1"
        />
        <Button variant="secondary" onClick={() => setShowFilters((s) => !s)} icon={<FiFilter size={16} />}>
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>

      {showFilters && (
        <div className="mb-8 flex flex-wrap items-end gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <Select label="Mode" value={filters.mode} onChange={(e) => applyFilter("mode", e.target.value)} containerClassName="w-40">
            <option value="">All modes</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </Select>
          <Select
            label="Registration"
            value={filters.registrationOpen}
            onChange={(e) => applyFilter("registrationOpen", e.target.value)}
            containerClassName="w-44"
          >
            <option value="">Any status</option>
            <option value="true">Open</option>
            <option value="false">Closed</option>
          </Select>
          <Select label="Sort by" value={filters.sort} onChange={(e) => applyFilter("sort", e.target.value)} containerClassName="w-48">
            <option value="-createdAt">Newest first</option>
            <option value="startDate">Starting soon</option>
            <option value="-prizePool">Highest prize pool</option>
            <option value="-registeredCount">Most popular</option>
          </Select>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} icon={<FiX size={14} />}>
              Clear all
            </Button>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      ) : !hackathons || hackathons.length === 0 ? (
        <EmptyState
          title="No hackathons found"
          description="Try adjusting your search or filters."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hackathons.map((h, i) => (
              <HackathonCard key={h._id} hackathon={h} index={i} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
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
  );
};

export default HackathonsPage;
