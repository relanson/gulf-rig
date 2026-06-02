"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Briefcase, PlusCircle, Shield, Anchor, Flame, Globe } from "lucide-react";
import Link from "next/link";
import JobCard from "./JobCard";
import AdBanner from "./AdBanner";
import WebJobCard, { type WebJobResult } from "./WebJobCard";
import { PROJECT_TYPES, getProjectLabel } from "@/lib/constants";

// Search query used when a project-type term is clicked (runs local + feed search).
const PT_QUERY: Record<string, string> = {
  construction: "Construction",
  pre_commissioning: "Commissioning",
  maintenance: "Maintenance",
  shutdown: "Shutdown",
  other: "Oil & Gas",
};

// Curated role list for "Today's Openings" — each role runs a local + feed search.
const ROLE_GROUPS: { category: string; color: string; roles: string[] }[] = [
  { category: "Instrumentation",   color: "#0284c7", roles: ["Instrument Technician", "Instrument Foreman", "Instrument Supervisor", "Instrument Engineer"] },
  { category: "Operation",         color: "#059669", roles: ["Field Operator", "DCS Operator", "Shift Supervisor-operation"] },
  { category: "Rotating Equipment", color: "#d97706", roles: ["Rotating Equipment Technician", "Rotating Equipment Foreman", "Rotating Equipment Supervisor", "Rotating Equipment Engineer"] },
  { category: "Mechanical",        color: "#dc2626", roles: ["Mechanical Technician", "Mechanical Foreman", "Mechanical Supervisor", "Mechanical Engineer"] },
  { category: "Electrical",        color: "#7c3aed", roles: ["Electrical Technician", "Electrical Foreman", "Electrical Supervisor", "Electrical Engineer"] },
];

interface Job {
  id: string; jobTitle: string; description: string | null;
  companyName: string; location: string; projectType: string;
  customProjectType?: string | null;
  currency: string; salary: string; experience: string;
  qualification: string; imageUrl: string | null; postType: string;
  approvedAt: string | null;
  posterName?: string | null; posterPhone?: string | null; posterEmail?: string | null;
  sourceUrl?: string | null;
}

export default function Feed() {
  const [jobs,        setJobs]        = useState<Job[]>([]);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [filter,      setFilter]      = useState("all");

  // ── Phase 2: aggregated "More jobs from around the Gulf" (only on filter==="all") ──
  const [webJobs,     setWebJobs]     = useState<WebJobResult[]>([]);
  const [webPage,     setWebPage]     = useState(1);
  const [webHasMore,  setWebHasMore]  = useState(true);
  const [webLoading,  setWebLoading]  = useState(false);

  const sentinelRef  = useRef<HTMLDivElement>(null);
  const observerRef  = useRef<IntersectionObserver | null>(null);
  // Holds the latest loadMore so the once-created observer never goes stale.
  const loadMoreRef  = useRef<() => void>(() => {});

  const fetchJobs = useCallback(async (pageNum: number, filterVal: string, reset = false) => {
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
  }, []);

  const fetchWebJobs = useCallback(async (pageNum: number) => {
    setWebLoading(true);
    try {
      const data = await fetch(`/api/web-jobs?page=${pageNum}`).then((r) => r.json());
      const incoming: WebJobResult[] = data.results || [];
      setWebJobs((prev) => {
        const seen = new Set(prev.map((r) => r.applyUrl));
        return [...prev, ...incoming.filter((r) => !seen.has(r.applyUrl))];
      });
      setWebHasMore(Boolean(data.available) && Boolean(data.hasMore));
      setWebPage(pageNum + 1);
    } catch (e) { console.error(e); setWebHasMore(false); }
    finally { setWebLoading(false); }
  }, []);

  useEffect(() => {
    setPage(1); setJobs([]); setHasMore(true);
    setWebJobs([]); setWebPage(1); setWebHasMore(true);
    fetchJobs(1, filter, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Decide what to load next: own jobs first, then aggregated web jobs (all view).
  loadMoreRef.current = () => {
    if (loading || webLoading) return;
    if (hasMore) { fetchJobs(page, filter); return; }
    if (filter === "all" && webHasMore) { fetchWebJobs(webPage); }
  };

  // Observer is created exactly once and always calls the latest loadMore.
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (e) => { if (e[0].isIntersecting) loadMoreRef.current(); },
      { rootMargin: "400px" }
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, []);

  // The observer only fires on intersection *changes*. After a load settles, if
  // the sentinel is still in view (e.g. phase 1 → phase 2 hand-off, or short
  // content), nudge the next load manually.
  useEffect(() => {
    if (loading || webLoading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight + 400 && rect.bottom > -400;
    if (inView) loadMoreRef.current();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, webLoading, hasMore, webHasMore, jobs.length, webJobs.length, filter]);

  if (initialLoad) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-3" style={{ background: "var(--fb-bg)" }}>
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--fb-blue) transparent var(--fb-blue) var(--fb-blue)" }} />
        <span className="font-semibold text-sm" style={{ color: "var(--fb-secondary)" }}>Loading jobs…</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen pt-[56px] justify-center" style={{ background: "var(--fb-bg)" }}>

      {/* ══════════ LEFT SIDEBAR ══════════ */}
      <aside className="hidden lg:flex flex-col gap-1 w-[280px] xl:w-[300px] shrink-0 px-3 py-4 sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto no-scrollbar">
        <SidebarLink href="/" icon={<Flame className="w-5 h-5" />}       label="Job Feed"   active={filter === "all"} onClick={() => setFilter("all")} />
        <SidebarLink href="/post" icon={<PlusCircle className="w-5 h-5" />} label="Post a Job" />
        <SidebarLink href="/admin" icon={<Shield className="w-5 h-5" />}   label="Admin Panel" />

        <hr className="my-2" style={{ borderColor: "var(--fb-border)" }} />

        <p className="px-3 py-1 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--fb-secondary)" }}>
          Project Type
        </p>
        <SidebarFilter label="All Projects" active={filter === "all"} onClick={() => setFilter("all")} dot="#65676B" />
        {PROJECT_TYPES.map((pt) => (
          <SidebarTermLink key={pt.value} label={pt.label} query={PT_QUERY[pt.value] ?? pt.label} dot={pt.color} />
        ))}

        <hr className="my-2" style={{ borderColor: "var(--fb-border)" }} />

        <div className="px-3 flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
          <Link href="/about" className="text-[11px] font-medium hover:underline" style={{ color: "var(--fb-secondary)" }}>About</Link>
          <Link href="/privacy" className="text-[11px] font-medium hover:underline" style={{ color: "var(--fb-secondary)" }}>Privacy Policy</Link>
        </div>

        <div className="px-3 flex items-center gap-1.5">
          <Anchor className="w-3.5 h-3.5" style={{ color: "var(--fb-secondary)" }} />
          <p className="text-[11px]" style={{ color: "var(--fb-secondary)" }}>
            Gulf-Rig © 2024 · Oil &amp; Gas Jobs Portal
          </p>
        </div>
      </aside>

      {/* ══════════ CENTER FEED ══════════ */}
      <main className="w-full min-w-0 max-w-[600px] py-4 px-2 md:px-0">

        {/* Mobile filter pills */}
        <div className="lg:hidden flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar px-1 pb-1">
          <FilterPill label="All" active={filter === "all"} onClick={() => setFilter("all")} color="#65676B" />
          {PROJECT_TYPES.map((pt) => (
            <FilterPill key={pt.value} label={pt.label.split(" ")[0]} active={filter === pt.value} onClick={() => setFilter(pt.value)} color={pt.color} />
          ))}
        </div>

        {/* Feed */}
        {jobs.length === 0 && webJobs.length === 0 && !loading && !webLoading ? (
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
            {/* Phase 1 — Gulf-Rig's own posted jobs (primary content) */}
            <div className="flex flex-col gap-3">
              {jobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>

            {loading && (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--fb-blue) transparent var(--fb-blue) var(--fb-blue)" }} />
              </div>
            )}

            {/* Phase 2 — aggregated listings from across the Gulf (all view only) */}
            {filter === "all" && !hasMore && (webJobs.length > 0 || webLoading) && (
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-3 px-1">
                  <div className="flex-1 h-px" style={{ background: "var(--fb-border)" }} />
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--fb-secondary)" }}>
                    <Globe className="w-3.5 h-3.5" /> More Oil &amp; Gas Jobs from Around the Gulf
                  </span>
                  <div className="flex-1 h-px" style={{ background: "var(--fb-border)" }} />
                </div>
                <p className="text-center text-[11px] mb-3 px-4" style={{ color: "var(--fb-secondary)" }}>
                  Aggregated listings from public recruitment feeds — each opens the original posting.
                </p>
                <div className="flex flex-col gap-3">
                  {webJobs.map((r, i) => <WebJobCard key={`web-${r.applyUrl}-${i}`} r={r} />)}
                </div>
              </div>
            )}

            {/* Shared sentinel — drives both phases */}
            <div ref={sentinelRef} className="h-2" />

            {webLoading && (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--fb-blue) transparent var(--fb-blue) var(--fb-blue)" }} />
              </div>
            )}

            {/* All caught up — only once both phases are exhausted */}
            {!loading && !webLoading && !hasMore && (filter !== "all" || !webHasMore) && (jobs.length > 0 || webJobs.length > 0) && (
              <p className="text-center text-sm py-6" style={{ color: "var(--fb-secondary)" }}>
                ✓ You&apos;re all caught up · {jobs.length + webJobs.length} jobs shown
              </p>
            )}
          </>
        )}

        <div className="h-16 md:h-0" />
      </main>

      {/* ══════════ TODAY'S OPENINGS COLUMN ══════════ */}
      <aside className="hidden xl:flex flex-col gap-3 w-[300px] shrink-0 px-3 py-4 sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto no-scrollbar">

        {/* Today's Openings — curated roles, each runs a local + feed search */}
        <div className="bg-white rounded-xl p-4" style={{ border: "1px solid var(--fb-border)", boxShadow: "0 1px 2px rgba(0,0,0,.1)" }}>
          <p className="font-bold text-base mb-2">Today&apos;s Openings</p>
          <div className="flex flex-col gap-2">
            {ROLE_GROUPS.map((group) => (
              <div key={group.category}>
                <div className="flex items-center gap-2 mb-0.5 px-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: group.color }} />
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--fb-secondary)" }}>
                    {group.category}
                  </span>
                </div>
                <div className="flex flex-col">
                  {group.roles.map((role) => (
                    <Link
                      key={role}
                      href={`/search?q=${encodeURIComponent(role)}`}
                      className="text-[13px] font-medium py-1 pl-4 pr-1 rounded-lg transition-colors"
                      style={{ color: "var(--fb-text)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--fb-hover)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      {role}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </aside>

      {/* ══════════ GOOGLE ADS — vertical skyscraper column (very wide screens) ══════════ */}
      <aside className="hidden 2xl:flex flex-col w-[300px] shrink-0 px-3 py-4 sticky top-[56px] h-[calc(100vh-56px)]">
        {/* ✏️ Get slot IDs: AdSense dashboard → Ads → By ad unit → Create ad unit */}
        <AdBanner
          adSlot="2222222222"
          adClient="ca-pub-1550416832618336"
          adFormat="vertical"
          fullWidthResponsive={false}
          style={{ width: 300 }}
        />
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

function SidebarFilter({ label, active, onClick, dot }: {
  label: string; active: boolean; onClick: () => void; dot: string;
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
    </button>
  );
}

/** Project-type term that navigates to a combined local + feed search. */
function SidebarTermLink({ label, query, dot }: { label: string; query: string; dot: string }) {
  return (
    <Link href={`/search?q=${encodeURIComponent(query)}`}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors w-full text-left"
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--fb-hover)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dot }} />
      <span className="flex-1 font-medium text-sm truncate" style={{ color: "var(--fb-text)" }}>{label}</span>
    </Link>
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
