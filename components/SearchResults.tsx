"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Briefcase } from "lucide-react";
import WebJobCard, { type WebJobResult } from "./WebJobCard";

type Result = WebJobResult;

export default function SearchResults({ q }: { q: string }) {
  const [results, setResults]   = useState<Result[]>([]);
  const [page, setPage]         = useState(1);
  const [hasMore, setHasMore]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [webAvailable, setWebAvailable] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchPage = useCallback(async (pageNum: number, reset: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}&page=${pageNum}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Search failed."); return; }
      setResults((prev) => (reset ? data.results : [...prev, ...data.results]));
      setHasMore(data.hasMore);
      setWebAvailable(data.webAvailable);
      setPage(pageNum + 1);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setDone(true);
    }
  }, [q]);

  useEffect(() => {
    setResults([]); setPage(1); setHasMore(false); setDone(false);
    if (q.trim().length >= 2) fetchPage(1, true);
    else setDone(true);
  }, [q, fetchPage]);

  return (
    <div className="flex min-h-screen justify-center pt-[56px]" style={{ background: "var(--fb-bg)" }}>
      <main className="w-full py-4 px-2 md:px-0" style={{ maxWidth: 640 }}>

        {/* Header */}
        <div className="bg-white rounded-xl p-4 mb-3 flex items-center gap-3" style={{ border: "1px solid var(--fb-border)" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--fb-blue-light)" }}>
            <Search className="w-5 h-5" style={{ color: "var(--fb-blue)" }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--fb-secondary)" }}>
              Search results for
            </p>
            <h1 className="font-bold text-lg truncate">{q}</h1>
          </div>
        </div>

        {/* Web-unavailable notice */}
        {done && !webAvailable && (
          <div className="rounded-xl p-3 mb-3 text-sm" style={{ background: "#FFF7ED", border: "1px solid #FED7AA", color: "#9A3412" }}>
            Live web results are temporarily unavailable — showing matches from Gulf-Rig only.
          </div>
        )}

        {/* Loading (initial) */}
        {loading && results.length === 0 && (
          <div className="flex items-center justify-center gap-3 py-16">
            <div className="w-7 h-7 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--fb-blue) transparent var(--fb-blue) var(--fb-blue)" }} />
            <span className="font-semibold text-sm" style={{ color: "var(--fb-secondary)" }}>Searching jobs…</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-white rounded-xl p-8 text-center" style={{ border: "1px solid var(--fb-border)" }}>
            <p className="text-sm font-medium" style={{ color: "#dc2626" }}>{error}</p>
          </div>
        )}

        {/* Empty */}
        {done && !loading && !error && results.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center" style={{ border: "1px solid var(--fb-border)" }}>
            <Briefcase className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--fb-secondary)" }} />
            <h3 className="font-bold text-lg mb-1">No jobs found</h3>
            <p className="text-sm mb-4" style={{ color: "var(--fb-secondary)" }}>
              Try a different job title, e.g. “Instrument Technician” or “Mechanical Supervisor”.
            </p>
            <Link href="/" className="inline-block px-5 py-2 rounded-full text-white text-sm font-semibold" style={{ background: "var(--fb-blue)" }}>
              Back to Feed
            </Link>
          </div>
        )}

        {/* Results */}
        <div className="flex flex-col gap-3">
          {results.map((r, i) => <WebJobCard key={`${r.source}-${r.id ?? r.applyUrl}-${i}`} r={r} />)}
        </div>

        {/* Load more */}
        {hasMore && !loading && (
          <button
            onClick={() => fetchPage(page, false)}
            className="w-full mt-4 py-3 rounded-xl text-sm font-bold transition-colors"
            style={{ background: "white", border: "1px solid var(--fb-border)", color: "var(--fb-blue)" }}
          >
            Load more results
          </button>
        )}
        {loading && results.length > 0 && (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--fb-blue) transparent var(--fb-blue) var(--fb-blue)" }} />
          </div>
        )}

        <div className="h-16 md:h-8" />
      </main>
    </div>
  );
}
