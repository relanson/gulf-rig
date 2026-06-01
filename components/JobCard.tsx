"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, DollarSign, GraduationCap, Clock,
  ChevronRight, MoreHorizontal, Factory, Mail, Phone,
} from "lucide-react";
import { getProjectType, getProjectLabel, getIndustryLabel } from "@/lib/constants";

interface Job {
  id: string;
  jobTitle: string;
  description: string | null;
  companyName: string;
  location: string;
  projectType: string;
  customProjectType?: string | null;
  currency: string;
  salary: string;
  experience: string;
  qualification: string;
  imageUrl: string | null;
  postType: string;
  approvedAt: string | null;
  industry?: string | null;
  customIndustry?: string | null;
  posterName?: string | null;
  posterPhone?: string | null;
  posterEmail?: string | null;
}

function avatarColor(name: string): string {
  const colors = ["#1877F2", "#E4430C", "#8B5CF6", "#0F9D58", "#F59E0B", "#EC4899", "#0EA5E9", "#6366F1"];
  return colors[name.charCodeAt(0) % colors.length];
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "Recently";
  const h = Math.floor((Date.now() - new Date(dateStr).getTime()) / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function JobCard({ job }: { job: Job }) {
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const pt      = getProjectType(job.projectType);
  const ptLabel = getProjectLabel(job.projectType, job.customProjectType);
  const bgColor = avatarColor(job.companyName);
  const initial = job.companyName.charAt(0).toUpperCase();
  const hasImage = job.imageUrl && !imgError;

  const MAX     = 180;
  const desc    = job.description ?? "";
  const isLong  = desc.length > MAX;
  const display = !expanded && isLong ? desc.slice(0, MAX) + "…" : desc;

  return (
    <article
      className="bg-white rounded-xl overflow-hidden mb-3"
      style={{ border: "1px solid var(--fb-border)", boxShadow: "0 1px 2px rgba(0,0,0,.1)" }}
    >
      {/* ── Post header ── */}
      <div className="flex items-start gap-2 px-4 pt-3 pb-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-base flex-shrink-0 shadow-sm"
          style={{ background: bgColor }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight" style={{ color: "var(--fb-text)" }}>{job.companyName}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs" style={{ color: "var(--fb-secondary)" }}>{timeAgo(job.approvedAt)}</span>
            <span className="text-xs" style={{ color: "var(--fb-secondary)" }}>·</span>
            <span className="text-xs" style={{ color: "var(--fb-secondary)" }}>🌐</span>
            {ptLabel && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-0.5"
                style={{ background: pt.color + "18", color: pt.color }}
              >
                {ptLabel}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {job.posterName && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "var(--fb-bg)", color: "var(--fb-text)", border: "1px solid var(--fb-border)" }}
            >
              {job.posterName}
            </span>
          )}
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[#F2F2F2]"
            style={{ color: "var(--fb-secondary)" }}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Job title + description ── */}
      <div className="px-4 pb-2">
        <h2 className="font-bold text-base mb-1 leading-snug" style={{ color: "var(--fb-text)" }}>{job.jobTitle}</h2>
        {desc && (
          <p className="text-sm leading-relaxed" style={{ color: "var(--fb-text)" }}>
            {display}
            {isLong && (
              <button onClick={() => setExpanded(!expanded)} className="font-semibold ml-1" style={{ color: "var(--fb-secondary)" }}>
                {expanded ? " See less" : " See more"}
              </button>
            )}
          </p>
        )}
      </div>

      {/* ── Image ── */}
      {hasImage && (
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <Image src={job.imageUrl!} alt={job.jobTitle} fill className="object-cover" onError={() => setImgError(true)} />
        </div>
      )}

      {/* ── All info chips (job details + contact) ── */}
      {(job.location || job.salary || job.experience || job.qualification || job.industry || job.posterName || job.posterEmail || job.posterPhone) && (
        <div className="px-4 py-2.5 flex flex-wrap gap-2">
          {job.location      && <Chip icon={<MapPin className="w-3.5 h-3.5" />}        text={job.location} />}
          {job.salary        && <Chip icon={<DollarSign className="w-3.5 h-3.5" />}    text={`${job.currency} ${job.salary}`} />}
          {job.experience    && <Chip icon={<Clock className="w-3.5 h-3.5" />}         text={formatExp(job.experience)} />}
          {job.qualification && <Chip icon={<GraduationCap className="w-3.5 h-3.5" />} text={job.qualification} />}
          {job.industry      && <Chip icon={<Factory className="w-3.5 h-3.5" />}       text={getIndustryLabel(job.industry, job.customIndustry)!} />}
          {job.posterEmail   && (
            <a href={`mailto:${job.posterEmail}`}>
              <Chip icon={<Mail className="w-3.5 h-3.5" />} text={job.posterEmail} />
            </a>
          )}
          {job.posterPhone   && (
            <a href={`tel:${job.posterPhone}`}>
              <Chip icon={<Phone className="w-3.5 h-3.5" />} text={job.posterPhone} />
            </a>
          )}
        </div>
      )}

      {/* ── Action bar: Details only ── */}
      <div className="flex items-center px-2 py-1" style={{ borderTop: "1px solid var(--fb-border)" }}>
        <Link
          href={`/job/${job.id}`}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ color: "var(--fb-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--fb-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          View Details <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

/** If experience looks like a plain number (e.g. "10"), append "+ years" */
function formatExp(exp: string): string {
  const trimmed = exp.trim();
  if (/year/i.test(trimmed)) return trimmed;
  const numMatch = trimmed.match(/^(\d+)\s*\+?$/);
  if (numMatch) return `${numMatch[1]}+ years`;
  if (trimmed.endsWith("+")) return `${trimmed} years`;
  return trimmed;
}

function Chip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: "var(--fb-bg)", color: "var(--fb-secondary)", border: "1px solid var(--fb-border)" }}
    >
      <span style={{ color: "var(--fb-blue)" }}>{icon}</span>
      {text}
    </span>
  );
}
