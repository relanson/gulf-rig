"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Building2, DollarSign, GraduationCap,
  Clock, Flame, Calendar, HardHat, ThumbsUp, Mail, Phone, User, Factory, ExternalLink,
} from "lucide-react";
import { getProjectType, getProjectLabel, getIndustryLabel, getGradient } from "@/lib/constants";

interface Job {
  id: string; jobTitle: string; description: string | null;
  companyName: string; location: string;
  projectType: string; customProjectType?: string | null;
  industry?: string | null; customIndustry?: string | null;
  currency: string; salary: string; experience: string; qualification: string;
  imageUrl: string | null; postType: string;
  createdAt: string; approvedAt: string | null;
  posterName?: string | null; posterPhone?: string | null; posterEmail?: string | null;
  sourceUrl?: string | null;
}

function avatarColor(name: string) {
  const c = ["#1877F2", "#E4430C", "#8B5CF6", "#0F9D58", "#F59E0B", "#EC4899", "#0EA5E9"];
  return c[name.charCodeAt(0) % c.length];
}
function timeAgo(d: string | null) {
  if (!d) return "Recently";
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (h < 1) return "Just now"; if (h < 24) return `${h}h ago`;
  const dy = Math.floor(h / 24); if (dy < 7) return `${dy}d ago`;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job,       setJob]       = useState<Job | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [interested,setInterested]= useState(false);
  const [imgError,  setImgError]  = useState(false);
  const [imgIndex,  setImgIndex]  = useState(0);

  useEffect(() => {
    fetch(`/api/jobs/${id}`).then(r => r.json()).then(d => {
      if (d.error) router.push("/"); else setJob(d);
    }).finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen gap-3" style={{ background: "var(--fb-bg)" }}>
      <div className="w-6 h-6 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--fb-blue) transparent var(--fb-blue) var(--fb-blue)" }} />
      <span className="text-sm font-medium" style={{ color: "var(--fb-secondary)" }}>Loading…</span>
    </div>
  );
  if (!job) return null;

  const pt      = getProjectType(job.projectType);
  const ptLabel = getProjectLabel(job.projectType, job.customProjectType);
  const gradient = getGradient(0);
  const bg       = avatarColor(job.companyName);
  const initial  = job.companyName.charAt(0).toUpperCase();

  // Parse multiple images
  const images: string[] = (() => {
    if (!job.imageUrl || imgError) return [];
    try {
      const parsed = JSON.parse(job.imageUrl);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [job.imageUrl];
    } catch { return [job.imageUrl]; }
  })();

  const Detail = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) => (
    <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid var(--fb-border)", boxShadow: "0 1px 2px rgba(0,0,0,.06)" }}>
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-1" style={{ color }}>
        <Icon className="w-3.5 h-3.5" />{label}
      </div>
      <p className="font-bold text-sm" style={{ color: "var(--fb-text)" }}>{value}</p>
    </div>
  );

  return (
    <>
      <div className="min-h-screen pt-[56px] pb-20 md:pb-8" style={{ background: "var(--fb-bg)" }}>
        <div className="max-w-[600px] mx-auto py-4 px-3">

          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold mb-3 transition-colors" style={{ color: "var(--fb-blue)" }}>
            <ArrowLeft className="w-4 h-4" /> Back to Feed
          </Link>

          {/* Main post card */}
          <div className="bg-white rounded-2xl overflow-hidden mb-3" style={{ border: "1px solid var(--fb-border)", boxShadow: "0 1px 4px rgba(0,0,0,.1)" }}>

            {/* Post header */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-extrabold text-lg shrink-0" style={{ background: bg }}>
                {initial}
              </div>
              <div className="flex-1">
                <p className="font-bold" style={{ color: "var(--fb-text)" }}>{job.companyName}</p>
                <p className="text-xs" style={{ color: "var(--fb-secondary)" }}>
                  {timeAgo(job.approvedAt)} · 🌐 ·{" "}
                  <span className="font-bold px-1.5 py-0.5 rounded" style={{ background: pt.color + "18", color: pt.color }}>{ptLabel}</span>
                </p>
              </div>
            </div>

            {/* Title */}
            <div className="px-4 pb-3">
              <h1 className="font-extrabold text-2xl leading-tight mb-2" style={{ color: "var(--fb-text)" }}>{job.jobTitle}</h1>
              <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--fb-secondary)" }}>
                <Building2 className="w-4 h-4 shrink-0" style={{ color: "var(--fb-blue)" }} />
                <span className="font-semibold">{job.companyName}</span>
                <span>·</span>
                <MapPin className="w-4 h-4 shrink-0" style={{ color: "var(--fb-blue)" }} />
                <span>{job.location}</span>
              </div>
            </div>

            {/* Image carousel or gradient */}
            {images.length > 0 ? (
              <div className="relative w-full" style={{ background: "#000" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[imgIndex]}
                  alt={job.jobTitle}
                  className="w-full block"
                  style={{ maxHeight: "700px", objectFit: "contain" }}
                  onError={() => setImgError(true)}
                />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                      style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>‹</button>
                    <button onClick={() => setImgIndex(i => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                      style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>›</button>
                    <span className="absolute bottom-2 right-2 text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.6)" }}>
                      {imgIndex + 1}/{images.length}
                    </span>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setImgIndex(i)} className="w-2 h-2 rounded-full transition-all"
                          style={{ background: i === imgIndex ? "#fff" : "rgba(255,255,255,0.5)" }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Flame className="w-20 h-20 text-white opacity-20" />
              </div>
            )}

            {/* Info grid — only show cards that have content */}
            {(job.salary || job.experience || job.qualification || job.industry || ptLabel) && (
              <div className="px-4 py-3 grid grid-cols-2 gap-2">
                {job.salary        && <Detail icon={DollarSign}    label="Salary"        value={`${job.currency} ${job.salary}`}                              color="var(--fb-blue)" />}
                {ptLabel           && <Detail icon={HardHat}       label="Project"       value={ptLabel}                                                       color={pt.color}       />}
                {job.industry      && <Detail icon={Factory}       label="Industry"      value={getIndustryLabel(job.industry, job.customIndustry)!}   color="#0EA5E9"        />}
                {job.experience    && <Detail icon={Clock}         label="Experience"    value={job.experience}                                        color="#F59E0B"        />}
                {job.qualification && <Detail icon={GraduationCap} label="Qualification" value={job.qualification}                                    color="#8B5CF6"        />}
              </div>
            )}

            {/* Posted date */}
            {job.approvedAt && (
              <div className="flex items-center px-4 pb-2 text-xs" style={{ color: "var(--fb-secondary)" }}>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(job.approvedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
            )}

            {/* Action bar */}
            <div className="flex gap-1 px-2 py-1" style={{ borderTop: "1px solid var(--fb-border)" }}>
              <button onClick={() => setInterested(!interested)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ color: interested ? "var(--fb-blue)" : "var(--fb-secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--fb-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <ThumbsUp className="w-5 h-5" fill={interested ? "var(--fb-blue)" : "none"} style={{ color: interested ? "var(--fb-blue)" : "var(--fb-secondary)" }} />
                Interested
              </button>
              {job.sourceUrl && (
                <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity"
                  style={{ background: "var(--fb-blue)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                  Apply Now <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Description card */}
          {job.description && (
            <div className="bg-white rounded-2xl p-4 mb-3" style={{ border: "1px solid var(--fb-border)", boxShadow: "0 1px 2px rgba(0,0,0,.06)" }}>
              <h2 className="font-bold text-base mb-2 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full inline-block" style={{ background: "var(--fb-blue)" }} />
                About this Role
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--fb-text)" }}>{job.description}</p>
            </div>
          )}

          {/* Poster contact card */}
          {job.posterName && (
            <div className="bg-white rounded-2xl p-4 mb-3" style={{ border: "1px solid var(--fb-border)", boxShadow: "0 1px 2px rgba(0,0,0,.06)" }}>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full inline-block" style={{ background: "#42B72A" }} />
                Contact the Poster
              </h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: "var(--fb-blue)" }}>
                  <User className="w-5 h-5" />
                </div>
                <p className="font-semibold text-sm" style={{ color: "var(--fb-text)" }}>{job.posterName}</p>
              </div>
              <div className="space-y-2">
                {job.posterEmail && (
                  <a href={`mailto:${job.posterEmail}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ background: "var(--fb-bg)", color: "var(--fb-text)", border: "1px solid var(--fb-border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--fb-blue)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--fb-border)")}>
                    <Mail className="w-4 h-4 shrink-0" style={{ color: "var(--fb-blue)" }} />
                    {job.posterEmail}
                  </a>
                )}
                {job.posterPhone && (
                  <a href={`tel:${job.posterPhone}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ background: "var(--fb-bg)", color: "var(--fb-text)", border: "1px solid var(--fb-border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--fb-blue)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--fb-border)")}>
                    <Phone className="w-4 h-4 shrink-0" style={{ color: "#42B72A" }} />
                    {job.posterPhone}
                  </a>
                )}
              </div>
            </div>
          )}

          <Link href="/" className="flex items-center justify-center gap-2 py-3 text-sm font-semibold" style={{ color: "var(--fb-blue)" }}>
            <ArrowLeft className="w-4 h-4" /> Back to all jobs
          </Link>
        </div>
      </div>

    </>
  );
}
