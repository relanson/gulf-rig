import Link from "next/link";
import { ExternalLink, MapPin, Building2, ChevronRight, Globe, BadgeCheck } from "lucide-react";

export interface WebJobResult {
  source: "local" | "web";
  id?: string;
  jobTitle: string;
  company: string;
  location: string;
  snippet: string;
  salary?: string;
  applyUrl: string;
  detailUrl?: string;
  provider?: string;
  updated?: string;
}

/** Shared card for both Gulf-Rig verified (local) and aggregated web listings. */
export default function WebJobCard({ r }: { r: WebJobResult }) {
  const isLocal = r.source === "local";
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid var(--fb-border)", boxShadow: "0 1px 2px rgba(0,0,0,.08)" }}>
      <div className="p-4">
        {/* Source badge */}
        <div className="flex items-center gap-2 mb-2">
          {isLocal ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--fb-blue-light)", color: "var(--fb-blue)" }}>
              <BadgeCheck className="w-3 h-3" /> Gulf-Rig Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--fb-bg)", color: "var(--fb-secondary)" }}>
              <Globe className="w-3 h-3" /> {r.provider || "Web"}
            </span>
          )}
        </div>

        <h2 className="font-bold text-base leading-snug mb-1">{r.jobTitle}</h2>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-2" style={{ color: "var(--fb-secondary)" }}>
          {r.company && <span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{r.company}</span>}
          {r.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{r.location}</span>}
        </div>

        {r.salary && (
          <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-md mb-2" style={{ background: "#ECFDF5", color: "var(--fb-green, #059669)" }}>
            {r.salary}
          </span>
        )}

        {r.snippet && (
          <p className="text-sm leading-relaxed mb-1" style={{ color: "var(--fb-text)" }}>
            {r.snippet}{r.snippet.length >= 240 ? "…" : ""}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-2 py-1" style={{ borderTop: "1px solid var(--fb-border)" }}>
        {isLocal && r.detailUrl && (
          <Link
            href={r.detailUrl}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ color: "var(--fb-text)" }}
          >
            View Details <ChevronRight className="w-4 h-4" />
          </Link>
        )}
        <a
          href={r.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold text-white transition-all"
          style={{ background: "var(--fb-blue)" }}
        >
          {isLocal ? "Apply Now" : "View Posting"} <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
