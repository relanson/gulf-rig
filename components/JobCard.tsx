"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin, DollarSign, GraduationCap, Clock,
  ChevronRight, ChevronLeft, MoreHorizontal, Factory, Mail, Phone, X,
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

/** Parse imageUrl — JSON array (new) or plain URL string (legacy) */
function parseImages(imageUrl: string | null): string[] {
  if (!imageUrl) return [];
  try {
    const parsed = JSON.parse(imageUrl);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [imageUrl];
  } catch {
    return [imageUrl];
  }
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
  const [imgError,      setImgError]      = useState(false);
  const [expanded,      setExpanded]      = useState(false);
  const [imgIndex,      setImgIndex]      = useState(0);
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [lightboxIdx,   setLightboxIdx]   = useState(0);

  const pt        = getProjectType(job.projectType);
  const ptLabel   = getProjectLabel(job.projectType, job.customProjectType);
  const bgColor   = avatarColor(job.companyName);
  const initial   = job.companyName.charAt(0).toUpperCase();
  const images    = imgError ? [] : parseImages(job.imageUrl);
  const hasImages = images.length > 0;

  const MAX     = 180;
  const desc    = job.description ?? "";
  const isLong  = desc.length > MAX;
  const display = !expanded && isLong ? desc.slice(0, MAX) + "…" : desc;

  const openLightbox = (idx: number) => { setLightboxIdx(idx); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const lbPrev = (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + images.length) % images.length); };
  const lbNext = (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % images.length); };

  const cardPrev = (e: React.MouseEvent) => { e.preventDefault(); setImgIndex(i => (i - 1 + images.length) % images.length); };
  const cardNext = (e: React.MouseEvent) => { e.preventDefault(); setImgIndex(i => (i + 1) % images.length); };

  return (
    <>
      <article
        className="bg-white rounded-xl overflow-hidden mb-3"
        style={{ border: "1px solid var(--fb-border)", boxShadow: "0 1px 2px rgba(0,0,0,.1)" }}
      >
        {/* ── Post header ── */}
        <div className="flex items-start gap-2 px-4 pt-3 pb-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-base flex-shrink-0 shadow-sm" style={{ background: bgColor }}>
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight" style={{ color: "var(--fb-text)" }}>{job.companyName}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs" style={{ color: "var(--fb-secondary)" }}>{timeAgo(job.approvedAt)}</span>
              <span className="text-xs" style={{ color: "var(--fb-secondary)" }}>·</span>
              <span className="text-xs" style={{ color: "var(--fb-secondary)" }}>🌐</span>
              {ptLabel && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-0.5" style={{ background: pt.color + "18", color: pt.color }}>
                  {ptLabel}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {job.posterName && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "var(--fb-bg)", color: "var(--fb-text)", border: "1px solid var(--fb-border)" }}>
                {job.posterName}
              </span>
            )}
            <button className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[#F2F2F2]" style={{ color: "var(--fb-secondary)" }}>
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

        {/* ── Images — natural aspect ratio like Facebook ── */}
        {hasImages && (
          <div className="relative w-full" style={{ background: "#000" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[imgIndex]}
              alt={job.jobTitle}
              className="w-full block cursor-zoom-in"
              style={{ maxHeight: "600px", objectFit: "contain" }}
              onClick={() => openLightbox(imgIndex)}
              onError={() => setImgError(true)}
            />
            {/* Navigation (multiple images) */}
            {images.length > 1 && (
              <>
                <button onClick={cardPrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-md" style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={cardNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-md" style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="absolute bottom-2 right-2 text-[11px] font-bold text-white px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.6)" }}>
                  {imgIndex + 1}/{images.length}
                </span>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={(e) => { e.preventDefault(); setImgIndex(i); }}
                      className="w-1.5 h-1.5 rounded-full transition-all"
                      style={{ background: i === imgIndex ? "#fff" : "rgba(255,255,255,0.45)" }} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Info chips ── */}
        {(job.location || job.salary || job.experience || job.qualification || job.industry || job.posterEmail || job.posterPhone) && (
          <div className="px-4 py-2.5 flex flex-wrap gap-2">
            {job.location      && <Chip icon={<MapPin className="w-3.5 h-3.5" />}        text={job.location} />}
            {job.salary        && <Chip icon={<DollarSign className="w-3.5 h-3.5" />}    text={`${job.currency} ${job.salary}`} />}
            {job.experience    && <Chip icon={<Clock className="w-3.5 h-3.5" />}         text={formatExp(job.experience)} />}
            {job.qualification && <Chip icon={<GraduationCap className="w-3.5 h-3.5" />} text={job.qualification} />}
            {job.industry      && <Chip icon={<Factory className="w-3.5 h-3.5" />}       text={getIndustryLabel(job.industry, job.customIndustry)!} />}
            {job.posterEmail   && <a href={`mailto:${job.posterEmail}`}><Chip icon={<Mail className="w-3.5 h-3.5" />} text={job.posterEmail} /></a>}
            {job.posterPhone   && <a href={`tel:${job.posterPhone}`}><Chip icon={<Phone className="w-3.5 h-3.5" />} text={job.posterPhone} /></a>}
          </div>
        )}

        {/* ── Action bar ── */}
        <div className="flex items-center px-2 py-1" style={{ borderTop: "1px solid var(--fb-border)" }}>
          <Link href={`/job/${job.id}`}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ color: "var(--fb-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--fb-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            View Details <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </article>

      {/* ── Lightbox modal ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.93)" }}
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center z-10"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
            onClick={closeLightbox}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <span className="absolute top-5 left-1/2 -translate-x-1/2 text-sm font-bold text-white px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
              {lightboxIdx + 1} / {images.length}
            </span>
          )}

          {/* Prev/Next */}
          {images.length > 1 && (
            <>
              <button onClick={lbPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button onClick={lbNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          {/* Full image — natural size, scrollable */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[lightboxIdx]}
            alt={job.jobTitle}
            className="max-w-[95vw] max-h-[92vh] object-contain rounded-lg select-none"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}
          />
        </div>
      )}
    </>
  );
}

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
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "var(--fb-bg)", color: "var(--fb-secondary)", border: "1px solid var(--fb-border)" }}>
      <span style={{ color: "var(--fb-blue)" }}>{icon}</span>
      {text}
    </span>
  );
}
