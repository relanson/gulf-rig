import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gulf-Rig — Oil & Gas Gulf Jobs Updated Daily",
  description:
    "Fresh oil & gas vacancies every day — Oman, Qatar, UAE, Saudi Arabia, Kuwait, Bahrain & more. Instrument, Mechanical, Electrical, Operations roles. Free to browse & apply.",
  openGraph: {
    title: "Gulf-Rig — Oil & Gas Gulf Jobs Updated Daily",
    description:
      "Fresh oil & gas vacancies every day — Oman, Qatar, UAE, Saudi Arabia, Kuwait, Bahrain & more. Free to browse & apply.",
    url: "https://www.gulf-rig.com/status",
    siteName: "Gulf-Rig",
    type: "website",
  },
};

const SITE = "https://www.gulf-rig.com";

/* ─── data ─────────────────────────────────────────────── */
const cards = [
  {
    id: 1,
    gradient: "from-[#0d1b2a] via-[#1b3a5c] to-[#0d2a1a]",
    accentColor: "#ff9d4d",
    tag: "🛢️ Gulf Jobs 2026",
    tagStyle: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
    headline: ["Fresh Oil & Gas", "Vacancies", "Posted Every Day"],
    accentWords: [2],
    body: "Instrument · Mechanical · Electrical\nRotating · Operations\nAll levels — ITI to Engineer",
    chips: ["🇴🇲 Oman","🇶🇦 Qatar","🇦🇪 UAE","🇸🇦 Saudi","🇰🇼 Kuwait","🇧🇭 Bahrain"],
    chipStyle: "bg-yellow-400/10 text-yellow-300 border border-yellow-400/20",
    ctaLabel: "Browse & Apply Free",
    note: "Share with your batchmates & colleagues 🙏",
  },
  {
    id: 2,
    gradient: "from-[#1a0800] via-[#7a2600] to-[#1a0000]",
    accentColor: "#ff9d4d",
    tag: "⚡ Urgent Hiring",
    tagStyle: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
    headline: ["Shutdown &", "Construction", "Projects Hiring Now"],
    accentWords: [0, 1],
    body: "Positions open across Qatar, Saudi Arabia,\nUAE and Kuwait.\nRecruiters interviewing this week.",
    chips: ["Instrument Technician","Mechanical Foreman","E&I Supervisor","QA/QC Inspector","Field Operator","Rotating Equipment"],
    chipStyle: "bg-white/8 text-white/80 border border-white/12",
    ctaLabel: "View All Vacancies",
    note: "Forward to anyone seeking Gulf work 🙏",
  },
  {
    id: 3,
    gradient: "from-[#001a1a] via-[#004d4d] to-[#001430]",
    accentColor: "#4dff99",
    tag: "✅ 100% Free",
    tagStyle: "bg-green-400/12 text-green-300 border border-green-400/25",
    headline: ["Real Jobs.", "Real Links.", "No Fake Postings."],
    accentWords: [2],
    body: "Every vacancy links directly to the recruiter's\noriginal post. Browse, verify, and apply\nyourself — no middleman, no fees.",
    chips: ["✅ Direct source links","✅ Updated daily","✅ Free to browse & apply","✅ Gulf + Africa locations"],
    chipStyle: "bg-green-400/10 text-green-200 border border-green-400/20",
    ctaLabel: "Start Browsing Now",
    note: "Always Free — No Registration Needed 🎉",
  },
  {
    id: 4,
    gradient: "from-[#0a0a2a] via-[#1a1a5c] to-[#2a1a00]",
    accentColor: "#ffd966",
    tag: "🛢️ Gulf + Africa",
    tagStyle: "bg-yellow-400/12 text-yellow-300 border border-yellow-400/25",
    headline: ["Your Next Gulf", "Job Is One", "Click Away."],
    accentWords: [2],
    body: "The easiest way to find oil & gas jobs across\nthe Middle East and Africa —\nupdated every single day.",
    chips: ["Qatar","UAE","Oman","Saudi","Kuwait","Bahrain","Iraq","Libya","Angola"],
    chipStyle: "bg-yellow-400/10 text-yellow-300 border border-yellow-400/20",
    ctaLabel: "Browse Free",
    note: "📢 Share with batchmates seeking Gulf work",
  },
  {
    id: 5,
    gradient: "from-[#111111] via-[#2a2a2a] to-[#0a1a0a]",
    accentColor: "#ff9d4d",
    tag: "👷 All Levels Welcome",
    tagStyle: "bg-white/8 text-white/70 border border-white/15",
    headline: ["ITI · Diploma", "B.E. · Engineer", "Gulf Jobs For Everyone."],
    accentWords: [2],
    body: "Whether you're a fresher or have 10 years of\nGulf experience — jobs for every level,\nposted every day.",
    chips: ["🔧 Technician","👷 Foreman","📋 Supervisor","🏗️ Engineer","🔍 QA/QC","⚙️ Operator"],
    chipStyle: "bg-white/8 text-white/80 border border-white/12",
    ctaLabel: "Apply Direct — It's Free",
    note: "📢 Tag a friend looking for Gulf work",
  },
];

/* ─── component ─────────────────────────────────────────── */
export default function StatusPage() {
  return (
    <div className="min-h-screen pt-[56px] pb-16" style={{ background: "#0f0f0f" }}>

      {/* page header */}
      <div className="text-center pt-8 pb-6 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
          style={{ background: "rgba(255,107,0,.12)", border: "1px solid rgba(255,107,0,.25)" }}>
          <span style={{ color: "#ff9d4d", fontSize: 13, fontWeight: 700, letterSpacing: "1.5px" }}>
            🔥 GULF-RIG.COM
          </span>
        </div>
        <h1 className="text-white font-black text-3xl leading-tight mb-2">
          Oil &amp; Gas Gulf Jobs
        </h1>
        <p style={{ color: "rgba(255,255,255,.5)", fontSize: 15 }}>
          Updated daily · Free to browse &amp; apply
        </p>
      </div>

      {/* cards */}
      <div className="flex flex-col items-center gap-8 px-4">
        {cards.map((c) => (
          <div
            key={c.id}
            className={`relative w-full max-w-sm rounded-3xl overflow-hidden bg-gradient-to-br ${c.gradient}`}
            style={{ minHeight: 560, boxShadow: "0 8px 40px rgba(0,0,0,.6)" }}
          >
            {/* glow circle */}
            <div className="absolute top-[-80px] right-[-100px] w-[300px] h-[300px] rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 70%)" }} />

            <div className="relative z-10 flex flex-col h-full p-7" style={{ minHeight: 560 }}>

              {/* brand */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#ff6b00,#ffcc00)" }}>
                  🔥
                </div>
                <div>
                  <p className="text-white font-extrabold text-base leading-none">Gulf-Rig</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,.4)", letterSpacing: "1.2px" }}>
                    OIL &amp; GAS JOB PORTAL
                  </p>
                </div>
              </div>

              {/* tag */}
              <span className={`inline-block self-start px-3 py-1.5 rounded-full text-xs font-bold mb-4 ${c.tagStyle}`}
                style={{ letterSpacing: "1px" }}>
                {c.tag}
              </span>

              {/* headline */}
              <div className="mb-5">
                {c.headline.map((line, i) => (
                  <p key={i} className="font-black leading-tight"
                    style={{
                      fontSize: 32,
                      color: c.accentWords.includes(i) ? c.accentColor : "#ffffff",
                      lineHeight: 1.15,
                    }}>
                    {line}
                  </p>
                ))}
              </div>

              {/* body */}
              <p className="mb-5 whitespace-pre-line"
                style={{ color: "rgba(255,255,255,.68)", fontSize: 15, lineHeight: 1.65 }}>
                {c.body}
              </p>

              {/* chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {c.chips.map((ch) => (
                  <span key={ch} className={`px-3 py-1.5 rounded-2xl text-xs font-semibold ${c.chipStyle}`}>
                    {ch}
                  </span>
                ))}
              </div>

              {/* spacer */}
              <div className="flex-1" />

              {/* CTA button — real clickable link */}
              <Link
                href={SITE}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full rounded-2xl px-5 py-4 mb-3 transition-opacity active:opacity-80"
                style={{
                  background: "rgba(255,255,255,.07)",
                  border: "1px solid rgba(255,255,255,.13)",
                  textDecoration: "none",
                }}
              >
                <div>
                  <p className="text-xs font-bold mb-1" style={{ color: "rgba(255,255,255,.4)", letterSpacing: "1.2px" }}>
                    {c.ctaLabel.toUpperCase()}
                  </p>
                  <p className="text-white font-extrabold text-lg leading-none">www.gulf-rig.com</p>
                </div>
                <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-black font-bold text-lg"
                  style={{ background: "linear-gradient(135deg,#ff6b00,#ffcc00)" }}>
                  →
                </div>
              </Link>

              {/* note */}
              <p className="text-center text-xs" style={{ color: "rgba(255,255,255,.3)" }}>
                {c.note}
              </p>

            </div>
          </div>
        ))}
      </div>

      {/* bottom CTA */}
      <div className="max-w-sm mx-auto px-4 mt-10">
        <Link
          href={SITE}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-extrabold text-black text-lg transition-opacity active:opacity-80"
          style={{ background: "linear-gradient(135deg,#ff6b00,#ffcc00)", textDecoration: "none" }}
        >
          🔥 Open Gulf-Rig Now
        </Link>
        <p className="text-center text-xs mt-3" style={{ color: "rgba(255,255,255,.3)" }}>
          Free to browse · No registration · Updated daily
        </p>
      </div>

    </div>
  );
}
