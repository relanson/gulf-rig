import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Flame, Briefcase, Globe, ShieldCheck, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "About — Gulf-Rig",
  description: "Gulf-Rig is a free oil & gas industry job portal connecting employers and skilled professionals across the Gulf region and worldwide.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-[56px] pb-20 md:pb-8" style={{ background: "var(--fb-bg)" }}>
      <div className="max-w-[760px] mx-auto py-6 px-4">

        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: "var(--fb-blue)" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>

        <div className="bg-white rounded-2xl p-6 md:p-8" style={{ border: "1px solid var(--fb-border)", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: "var(--fb-blue)" }}>
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl leading-tight" style={{ color: "var(--fb-text)" }}>About Gulf-Rig</h1>
              <p className="text-sm" style={{ color: "var(--fb-secondary)" }}>Oil &amp; Gas Industry Jobs Portal</p>
            </div>
          </div>

          <div className="space-y-5 text-sm leading-relaxed" style={{ color: "var(--fb-text)" }}>
            <p>
              <b>Gulf-Rig</b> is a free job portal built specifically for the oil &amp; gas industry. We connect
              employers, recruiters, and contracting companies with skilled professionals — welders, fitters,
              riggers, supervisors, commissioning engineers, and more — across the Gulf region and worldwide.
            </p>
            <p>
              Whether you run construction, shutdown, maintenance, or pre-commissioning projects, Gulf-Rig makes
              it simple to share openings with the right people. No account or login is required to browse or post.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <Feature icon={Briefcase} title="Post Jobs Free" text="Publish a vacancy in minutes — with photos, salary, and contact details." />
              <Feature icon={Globe}     title="Global Reach"  text="Reach oil & gas professionals across the Gulf, India, and beyond." />
              <Feature icon={ShieldCheck} title="Reviewed Posts" text="Every posting is reviewed by an admin before going live." />
              <Feature icon={Send}      title="Direct Contact" text="Job seekers contact employers directly — no middlemen." />
            </div>

            <div>
              <h2 className="font-bold text-base mb-1.5" style={{ color: "var(--fb-text)" }}>What We Cover</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Construction projects</li>
                <li>Pre-Commissioning &amp; Commissioning</li>
                <li>Maintenance contracts</li>
                <li>Plant shutdowns &amp; turnarounds</li>
                <li>Refineries, petrochemical, power, fertilizer, and steel plants</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-base mb-1.5" style={{ color: "var(--fb-text)" }}>Get in Touch</h2>
              <p>
                Have a question, suggestion, or want a posting removed? Email us at{" "}
                <a href="mailto:contact.gulfrig@gmail.com" className="font-semibold underline" style={{ color: "var(--fb-blue)" }}>
                  contact.gulfrig@gmail.com
                </a>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/post" className="px-5 py-2.5 rounded-full text-white text-sm font-bold" style={{ background: "var(--fb-blue)" }}>
              Post a Job
            </Link>
            <Link href="/privacy" className="px-5 py-2.5 rounded-full text-sm font-semibold" style={{ background: "var(--fb-bg)", color: "var(--fb-text)", border: "1px solid var(--fb-border)" }}>
              Privacy Policy
            </Link>
          </div>
        </div>

        <Link href="/" className="flex items-center justify-center gap-2 py-4 text-sm font-semibold" style={{ color: "var(--fb-blue)" }}>
          <ArrowLeft className="w-4 h-4" /> Back to all jobs
        </Link>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--fb-bg)", border: "1px solid var(--fb-border)" }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" style={{ color: "var(--fb-blue)" }} />
        <p className="font-bold text-sm" style={{ color: "var(--fb-text)" }}>{title}</p>
      </div>
      <p className="text-xs" style={{ color: "var(--fb-secondary)" }}>{text}</p>
    </div>
  );
}
