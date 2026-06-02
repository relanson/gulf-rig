"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Briefcase, PlusCircle, Shield, Anchor, Flame } from "lucide-react";
import Link from "next/link";
import JobCard from "./JobCard";
import AdBanner from "./AdBanner";
import { PROJECT_TYPES, getProjectLabel } from "@/lib/constants";

interface Job {
  id: string; jobTitle: string; description: string | null;
  companyName: string; location: string; projectType: string;
  customProjectType?: string | null;
  currency: string; salary: string; experience: string;
  qualification: string; imageUrl: string | null; postType: string;
  approvedAt: string | null;
  posterName?: string | null; posterPhone?: string | null; posterEmail?: string | null;
}

export default function Feed() {
  const [jobs,        setJobs]        = useState<Job[]>([]);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [filter,      setFilter]      = useState("all");
  const sentinelRef  = useRef<HTMLDivElement>(null);
  const observerRef  = useRef<IntersectionObserver | null>(null);

  const fetchJobs = useCallback(async (pageNum: number, filterVal: string, reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(pageNum), limit: "10" });
      if (filterVal !== "all") p.set("projectType", filterVal);
      const data = await fetch(`/api/jobs?${p}`).then((r) => r.json());
      setJobs((prev) => (reset ? data.jobs : [...prev, ...data.jobs]));
      setHasMore(data.hasMore);
      setPage(pageNum + 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setInitialLoad(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1); setJobs([]); setHasMore(true);
    fetchJobs(1, filter, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (e) => { if (e[0].isIntersecting && hasMore && !loading) fetchJobs(page, filter); },
      { rootMargin: "400px" }
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, page, filter, fetchJobs]);

  const counts = Object.fromEntries(
    PROJECT_TYPES.map((pt) => [pt.value, jobs.filter((j) => j.projectType === pt.value).length])
  );

  if (initialLoad) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-3" style={{ background: "var(--fb-bg)" }}>
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--fb-blue) transparent var(--fb-blue) var(--fb-blue)" }} />
        <span className="font-semibold text-sm" style={{ color: "var(--fb-secondary)" }}>Loading jobs…</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen pt-[56px]" style={{ background: "var(--fb-bg)" }}>

      {/* ══════════ LEFT SIDEBAR ══════════ */}
      <aside className="hidden lg:flex flex-col gap-1 w-[280px] xl:w-[340px] shrink-0 px-3 py-4 sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto no-scrollbar">
        <SidebarLink href="/" icon={<Flame className="w-5 h-5" />}       label="Job Feed"   active={filter === "all"} onClick={() => setFilter("all")} />
        <SidebarLink href="/post" icon={<PlusCircle className="w-5 h-5" />} label="Post a Job" />
        <SidebarLink href="/admin" icon={<Shield className="w-5 h-5" />}   label="Admin Panel" />

        <hr className="my-2" style={{ borderColor: "var(--fb-border)" }} />

        <p className="px-3 py-1 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--fb-secondary)" }}>
          Project Type
        </p>
        <SidebarFilter label="All Projects" active={filter === "all"} onClick={() => setFilter("all")} dot="#65676B" count={jobs.length} />
        {PROJECT_TYPES.map((pt) => (
          <SidebarFilter
            key={pt.value}
            label={pt.label}
            active={filter === pt.value}
            onClick={() => setFilter(pt.value)}
            dot={pt.color}
            count={counts[pt.value] ?? 0}
          />
        ))}

        <hr className="my-2" style={{ borderColor: "var(--fb-border)" }} />

        <div className="px-3 flex items-center gap-1.5">
          <Anchor className="w-3.5 h-3.5" style={{ color: "var(--fb-secondary)" }} />
          <p className="text-[11px]" style={{ color: "var(--fb-secondary)" }}>
            Gulf-Rig © 2024 · Oil &amp; Gas Jobs Portal
          </p>
        </div>
      </aside>

      {/* ══════════ CENTER FEED ══════════ */}
      <main className="flex-1 min-w-0 py-4 px-2 md:px-0" style={{ maxWidth: 600 }}>

        {/* Mobile filter pills */}
        <div className="lg:hidden flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar px-1 pb-1">
          <FilterPill label="All" active={filter === "all"} onClick={() => setFilter("all")} color="#65676B" />
          {PROJECT_TYPES.map((pt) => (
            <FilterPill key={pt.value} label={pt.label.split(" ")[0]} active={filter === pt.value} onClick={() => setFilter(pt.value)} color={pt.color} />
          ))}
        </div>

        {/* Feed */}
        {jobs.length === 0 && !loading ? (
          <div className="bg-white rounded-xl p-10 text-center" style={{ border: "1px solid var(--fb-border)" }}>
            <Briefcase className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--fb-secondary)" }} />
            <h3 className="font-bold text-lg mb-1">No Jobs Found</h3>
            <p className="text-sm mb-4" style={{ color: "var(--fb-secondary)" }}>
              {filter !== "all" ? "No jobs in this category yet." : "No approved jobs yet. Check back soon!"}
            </p>
            <button onClick={() => setFilter("all")} className="px-5 py-2 rounded-full text-white text-sm font-semibold" style={{ background: "var(--fb-blue)" }}>
              View All Jobs
            </button>
          </div>
        ) : (
          <>
            {jobs.map((job) => <JobCard key={job.id} job={job} />)}
            <div ref={sentinelRef} className="h-2" />
            {loading && (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--fb-blue) transparent var(--fb-blue) var(--fb-blue)" }} />
              </div>
            )}
            {!hasMore && jobs.length > 0 && (
              <p className="text-center text-sm py-6" style={{ color: "var(--fb-secondary)" }}>
                ✓ You&apos;re all caught up · {jobs.length} jobs shown
              </p>
            )}
          </>
        )}

        <div className="h-16 md:h-0" />
      </main>

      {/* ══════════ RIGHT PANEL ══════════ */}
      <aside className="hidden xl:flex flex-col gap-3 w-[360px] shrink-0 px-3 py-4 sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto no-scrollbar">

        {/* Today's Openings by category */}
        <div className="bg-white rounded-xl p-4" style={{ border: "1px solid var(--fb-border)", boxShadow: "0 1px 2px rgba(0,0,0,.1)" }}>
          <p className="font-bold text-base mb-3">Today&apos;s Openings</p>
          <div className="flex flex-col gap-2">
            {PROJECT_TYPES.map((pt) => (
              <button
                key={pt.value}
                onClick={() => setFilter(filter === pt.value ? "all" : pt.value)}
                className="flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left w-full"
                style={{ background: filter === pt.value ? "var(--fb-blue-light)" : "var(--fb-bg)" }}
              >
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: pt.color }}>
                  {pt.label.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{pt.label}</p>
                  <p className="text-xs" style={{ color: "var(--fb-secondary)" }}>{counts[pt.value] ?? 0} jobs</p>
                </div>
                {filter === pt.value && (
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--fb-blue)" }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Google Ad #1 — below Today's Openings ── */}
        {/* ✏️ Get slot IDs: AdSense dashboard → Ads → By ad unit → Create ad unit */}
        <AdBanner adSlot="1111111111" adClient="ca-pub-1550416832618336" />

        {/* ── Google Ad #2 — bottom of sidebar ── */}
        <AdBanner adSlot="2222222222" adClient="ca-pub-1550416832618336" />

      </aside>
    </div>
  );
}

/* ── Sidebar helpers ── */
function SidebarLink({ href, icon, label, active, onClick }: {
  href: string; icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
      style={{ background: active ? "var(--fb-blue-light)" : "transparent", color: active ? "var(--fb-blue)" : "var(--fb-text)" }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--fb-hover)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ color: active ? "var(--fb-blue)" : "var(--fb-secondary)" }}>{icon}</span>
      <span className="font-semibold text-sm">{label}</span>
    </Link>
  );
}

function SidebarFilter({ label, active, onClick, dot, count }: {
  label: string; active: boolean; onClick: () => void; dot: string; count: number;
}) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors w-full text-left"
      style={{ background: active ? "var(--fb-blue-light)" : "transparent" }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--fb-hover)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = active ? "var(--fb-blue-light)" : "transparent"; }}
    >
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dot }} />
      <span className="flex-1 font-medium text-sm truncate" style={{ color: active ? "var(--fb-blue)" : "var(--fb-text)" }}>{label}</span>
      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--fb-bg)", color: "var(--fb-secondary)" }}>{count}</span>
    </button>
  );
}

function FilterPill({ label, active, onClick, color }: {
  label: string; active: boolean; onClick: () => void; color: string;
}) {
  return (
    <button onClick={onClick}
      className="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all"
      style={{
        background: active ? color : "white",
        color: active ? "white" : "var(--fb-secondary)",
        borderColor: active ? color : "var(--fb-border)",
      }}
    >
      {label}
    </button>
  );
}

// Keep getProjectLabel used in this file (re-exported for convenience)
export { getProjectLabel };
