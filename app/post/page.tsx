"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Upload, X, Flame, CheckCircle, ArrowLeft, Loader2, User, Phone, Mail,
} from "lucide-react";
import { PROJECT_TYPES, INDUSTRIES, CURRENCIES } from "@/lib/constants";

export default function PostJobPage() {
  const [form, setForm] = useState({
    jobTitle: "", description: "", projectType: "", customProjectType: "",
    industry: "", customIndustry: "",
    currency: "USD", salary: "", experience: "", qualification: "", location: "", companyName: "",
    posterName: "", posterPhone: "", posterEmail: "",
  });
  const [imgFile,  setImgFile]  = useState<File | null>(null);
  const [preview,  setPreview]  = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File) => { setImgFile(f); setPreview(URL.createObjectURL(f)); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!form.companyName.trim())  { setError("Please enter the company or employer name."); return; }
    if (!form.posterName.trim())   { setError("Please enter your name."); return; }
    if (!form.posterEmail.trim())  { setError("Please enter your email address."); return; }

    // Auto-detect postType
    const hasImage = !!imgFile;
    const hasDesc  = !!form.description.trim();
    const postType = hasImage && hasDesc ? "image_with_caption"
                   : hasImage            ? "image_only"
                   : "caption_only";

    setLoading(true);
    try {
      let imageUrl: string | null = null;
      if (imgFile) {
        const fd = new FormData(); fd.append("file", imgFile);
        const r = await fetch("/api/upload", { method: "POST", body: fd });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        imageUrl = d.url;
      }
      const payload = {
        ...form,
        customProjectType: form.projectType === "other" ? form.customProjectType.trim() : null,
        industry:          form.industry || null,
        customIndustry:    form.industry === "other" ? form.customIndustry.trim() : null,
        postType,
        imageUrl,
      };
      const r2 = await fetch("/api/jobs", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!r2.ok) throw new Error((await r2.json()).error);
      setSuccess(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setLoading(false); }
  };

  const reset = () => {
    setSuccess(false);
    setForm({ jobTitle: "", description: "", projectType: "", customProjectType: "",
      industry: "", customIndustry: "",
      currency: "USD", salary: "", experience: "", qualification: "", location: "", companyName: "",
      posterName: "", posterPhone: "", posterEmail: "" });
    setImgFile(null); setPreview(null); setError("");
  };

  const inp = "w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all";
  const inpStyle = { background: "var(--fb-bg)", border: "1px solid var(--fb-border)", color: "var(--fb-text)" };
  const lbl = "block text-sm font-semibold mb-1.5";
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "var(--fb-blue)");
  const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "var(--fb-border)");

  if (success) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--fb-bg)" }}>
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center mx-4" style={{ border: "1px solid var(--fb-border)", boxShadow: "0 4px 12px rgba(0,0,0,.1)" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#E6F4EA" }}>
          <CheckCircle className="w-8 h-8" style={{ color: "var(--fb-green)" }} />
        </div>
        <h2 className="font-bold text-xl mb-2">Job Submitted! 🎉</h2>
        <p className="text-sm mb-6" style={{ color: "var(--fb-secondary)" }}>
          Your post is under review and will go live once approved by our team.
        </p>
        <div className="flex flex-col gap-2">
          <button onClick={reset} className="w-full py-2.5 rounded-xl text-white font-bold text-sm" style={{ background: "var(--fb-blue)" }}>Post Another Job</button>
          <Link href="/" className="w-full py-2.5 rounded-xl font-bold text-sm text-center" style={{ background: "var(--fb-bg)", color: "var(--fb-text)" }}>Back to Feed</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-[56px] pb-24 md:pb-8" style={{ background: "var(--fb-bg)" }}>
      <div className="max-w-[600px] mx-auto py-4 px-3">

        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold mb-3 transition-colors" style={{ color: "var(--fb-blue)" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>

        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid var(--fb-border)", boxShadow: "0 1px 4px rgba(0,0,0,.1)" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--fb-border)" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: "var(--fb-blue)" }}>
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-base">Create Job Post</p>
              <p className="text-xs" style={{ color: "var(--fb-secondary)" }}>No login required · Reviewed before going live</p>
            </div>
          </div>

          <form onSubmit={submit} className="p-4 space-y-4">

            {/* ── Image Upload ── */}
            <div>
              <label className={lbl}>Job Photo</label>
              {preview ? (
                <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  <Image src={preview} alt="preview" fill className="object-cover" />
                  <button type="button" onClick={() => { setImgFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                    <X className="w-4 h-4" style={{ color: "var(--fb-secondary)" }} />
                  </button>
                </div>
              ) : (
                <div onClick={() => fileRef.current?.click()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) pickFile(f); }}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
                  style={{ borderColor: "var(--fb-border)", background: "var(--fb-bg)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--fb-blue)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--fb-border)")}>
                  <Upload className="w-7 h-7 mx-auto mb-2" style={{ color: "var(--fb-secondary)" }} />
                  <p className="text-sm font-semibold" style={{ color: "var(--fb-text)" }}>Add Photo</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--fb-secondary)" }}>JPG, PNG, WEBP · Max 10 MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }} className="hidden" />
            </div>

            {/* ── Job Title ── */}
            <div>
              <label className={lbl}>Job Title</label>
              <input type="text" placeholder="e.g. Senior Piping Engineer" value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                className={inp} style={inpStyle} onFocus={focus} onBlur={blur} />
            </div>

            {/* ── Description ── */}
            <div>
              <label className={lbl}>Job Description</label>
              <textarea rows={4} placeholder="Describe the role, requirements, responsibilities…"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${inp} resize-none`} style={inpStyle} onFocus={focus} onBlur={blur} />
            </div>

            {/* ── Project Type ── */}
            <div>
              <label className={lbl}>Project Type</label>
              <select value={form.projectType}
                onChange={(e) => setForm({ ...form, projectType: e.target.value, customProjectType: "" })}
                className={`${inp} appearance-none cursor-pointer`} style={inpStyle} onFocus={focus} onBlur={blur}>
                <option value="">— Select Project Type —</option>
                {PROJECT_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              {form.projectType === "other" && (
                <input type="text" placeholder="e.g. Offshore Installation, Pipeline Survey…"
                  value={form.customProjectType}
                  onChange={(e) => setForm({ ...form, customProjectType: e.target.value })}
                  className={`${inp} mt-2`} style={inpStyle} onFocus={focus} onBlur={blur} />
              )}
            </div>

            {/* ── Industry ── */}
            <div>
              <label className={lbl}>Industry</label>
              <select value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value, customIndustry: "" })}
                className={`${inp} appearance-none cursor-pointer`} style={inpStyle} onFocus={focus} onBlur={blur}>
                <option value="">— Select Industry —</option>
                {INDUSTRIES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
              {form.industry === "other" && (
                <input type="text" placeholder="e.g. LNG Terminal, Mining, Water Treatment…"
                  value={form.customIndustry}
                  onChange={(e) => setForm({ ...form, customIndustry: e.target.value })}
                  className={`${inp} mt-2`} style={inpStyle} onFocus={focus} onBlur={blur} />
              )}
            </div>

            {/* ── Salary ── */}
            <div>
              <label className={lbl}>Salary</label>
              <div className="flex gap-2">
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className={`w-28 ${inp} appearance-none cursor-pointer`} style={inpStyle} onFocus={focus} onBlur={blur}>
                  {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <input type="text" placeholder="e.g. 8,000 / month" value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  className={`flex-1 ${inp}`} style={inpStyle} onFocus={focus} onBlur={blur} />
              </div>
            </div>

            {/* ── Other job details ── */}
            {[
              { k: "experience",    label: "Experience",         ph: "e.g. 5+ years in Oil & Gas",  req: false },
              { k: "qualification", label: "Qualification",      ph: "e.g. B.E. Mechanical",         req: false },
              { k: "location",      label: "Location",           ph: "e.g. Abu Dhabi, UAE",           req: false },
              { k: "companyName",   label: "Company / Employer", ph: "e.g. ADNOC, Shell, Aramco",    req: true  },
            ].map(({ k, label, ph, req }) => (
              <div key={k}>
                <label className={lbl}>
                  {label}{req && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <input type="text" placeholder={ph} value={form[k as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className={inp} style={inpStyle} onFocus={focus} onBlur={blur} />
              </div>
            ))}

            {/* ── Poster Contact Info ── */}
            <div className="pt-1" style={{ borderTop: "1px solid var(--fb-border)" }}>
              <div className="flex items-center gap-2 mb-1 mt-2">
                <User className="w-4 h-4" style={{ color: "var(--fb-blue)" }} />
                <p className="font-bold text-sm" style={{ color: "var(--fb-text)" }}>Poster Contact Info</p>
              </div>
              <p className="text-xs mb-3" style={{ color: "var(--fb-secondary)" }}>
                Visible to job seekers so they can reach you directly.
              </p>

              <div className="space-y-3">
                {/* Name — required */}
                <div>
                  <label className={lbl}>
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="e.g. Ahmed Al-Rashidi" value={form.posterName}
                    onChange={(e) => setForm({ ...form, posterName: e.target.value })}
                    className={inp} style={inpStyle} onFocus={focus} onBlur={blur} />
                </div>

                {/* Phone — optional, no label hint */}
                <div>
                  <label className={lbl}><Phone className="w-3.5 h-3.5 inline mr-1" />Phone Number</label>
                  <input type="tel" placeholder="+971 50 000 0000" value={form.posterPhone}
                    onChange={(e) => setForm({ ...form, posterPhone: e.target.value })}
                    className={inp} style={inpStyle} onFocus={focus} onBlur={blur} />
                </div>

                {/* Email — optional, no label hint */}
                <div>
                  <label className={lbl}><Mail className="w-3.5 h-3.5 inline mr-1" />Email Address <span className="text-red-500">*</span></label>
                  <input type="email" placeholder="recruiter@company.com" value={form.posterEmail}
                    onChange={(e) => setForm({ ...form, posterEmail: e.target.value })}
                    className={inp} style={inpStyle} onFocus={focus} onBlur={blur} />
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2">{error}</p>}

            <div className="rounded-xl px-3 py-2.5 text-xs" style={{ background: "#FFF9E6", color: "#986801", border: "1px solid #FFE082" }}>
              ℹ️ Your post will be reviewed by our team before appearing in the feed. Usually within 24 hours.
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
              style={{ background: "var(--fb-blue)", opacity: loading ? 0.75 : 1 }}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting…</> : "Post Job"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
