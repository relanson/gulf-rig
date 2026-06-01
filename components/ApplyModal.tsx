"use client";

import { useState } from "react";
import { X, Send, CheckCircle } from "lucide-react";

interface Props { jobId: string; jobTitle: string; companyName: string; onClose: () => void; }

export default function ApplyModal({ jobId, jobTitle, companyName, onClose }: Props) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", resumeLink: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const r = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setSuccess(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all";
  const inputStyle = { background: "var(--fb-bg)", border: "1px solid var(--fb-border)", color: "var(--fb-text)" };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full md:max-w-lg bg-white md:rounded-2xl rounded-t-3xl z-10 max-h-[92vh] overflow-y-auto"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,.25)" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-4 py-3 rounded-t-3xl md:rounded-t-2xl" style={{ borderBottom: "1px solid var(--fb-border)" }}>
          <h2 className="font-bold text-xl" style={{ color: "var(--fb-text)" }}>Apply for Job</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ background: "var(--fb-bg)", color: "var(--fb-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#CDD0D4")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--fb-bg)")}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#E6F4EA" }}>
              <CheckCircle className="w-10 h-10" style={{ color: "var(--fb-green)" }} />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-1">Application Sent! 🎉</h3>
              <p className="text-sm" style={{ color: "var(--fb-secondary)" }}>
                Your application for <b>{jobTitle}</b> at <b>{companyName}</b> has been submitted.
              </p>
            </div>
            <button onClick={onClose} className="px-8 py-2.5 rounded-full text-white font-bold text-sm" style={{ background: "var(--fb-blue)" }}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-4 space-y-3">
            <p className="text-sm" style={{ color: "var(--fb-secondary)" }}>
              Applying for <span className="font-semibold" style={{ color: "var(--fb-blue)" }}>{jobTitle}</span> at <b>{companyName}</b>
            </p>

            {[
              { k: "name",       label: "Full Name",             type: "text",  ph: "Your full name",            req: true  },
              { k: "phone",      label: "Phone Number",          type: "tel",   ph: "+971 50 000 0000",          req: true  },
              { k: "email",      label: "Email Address",         type: "email", ph: "you@example.com",           req: true  },
              { k: "resumeLink", label: "Resume / LinkedIn URL", type: "url",   ph: "https://linkedin.com/in/…", req: false },
            ].map(({ k, label, type, ph, req }) => (
              <div key={k}>
                <label className="block text-sm font-semibold mb-1" style={{ color: "var(--fb-text)" }}>
                  {label}{req && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <input required={req} type={type} placeholder={ph}
                  value={form[k as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className={inputClass} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--fb-blue)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--fb-border)")} />
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold mb-1">Cover Message</label>
              <textarea rows={3} placeholder="Why are you a great fit for this role?"
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`${inputClass} resize-none`} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--fb-blue)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--fb-border)")} />
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-opacity"
              style={{ background: "var(--fb-blue)", opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting…</>
                : <><Send className="w-4 h-4" /> Submit Application</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
