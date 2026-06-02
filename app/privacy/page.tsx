import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Gulf-Rig",
  description: "How Gulf-Rig collects, uses, and protects your data, including the use of cookies and third-party advertising.",
};

const UPDATED = "June 2, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-[56px] pb-20 md:pb-8" style={{ background: "var(--fb-bg)" }}>
      <div className="max-w-[760px] mx-auto py-6 px-4">

        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: "var(--fb-blue)" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>

        <div className="bg-white rounded-2xl p-6 md:p-8" style={{ border: "1px solid var(--fb-border)", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>

          <div className="flex items-center gap-3 mb-1">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: "var(--fb-blue)" }}>
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="font-extrabold text-2xl" style={{ color: "var(--fb-text)" }}>Privacy Policy</h1>
          </div>
          <p className="text-xs mb-6" style={{ color: "var(--fb-secondary)" }}>Last updated: {UPDATED}</p>

          <div className="space-y-5 text-sm leading-relaxed" style={{ color: "var(--fb-text)" }}>

            <p>
              Gulf-Rig (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website{" "}
              <span className="font-semibold">gulf-rig.com</span>, a free portal for posting and discovering
              jobs in the oil &amp; gas industry. This Privacy Policy explains what information we collect,
              how we use it, and the choices you have.
            </p>

            <Section title="1. Information We Collect">
              <p>We collect only the information needed to operate the job portal:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><b>Job posting details</b> you voluntarily submit — job title, description, company name, location, salary, and images.</li>
                <li><b>Contact details</b> you choose to include — your name, email address, and phone number, so applicants can reach you.</li>
                <li><b>Usage data</b> — basic, anonymous analytics such as pages viewed and approximate region, collected automatically.</li>
              </ul>
              <p className="mt-2">No account or login is required to browse or post jobs.</p>
            </Section>

            <Section title="2. How We Use Information">
              <ul className="list-disc pl-5 space-y-1">
                <li>To display job postings on the public feed after admin review.</li>
                <li>To allow job seekers to contact employers via the details provided.</li>
                <li>To improve the site&apos;s content, performance, and user experience.</li>
              </ul>
            </Section>

            <Section title="3. Cookies and Web Beacons">
              <p>
                Gulf-Rig uses cookies to improve your browsing experience and to serve advertising.
                Cookies are small text files stored on your device. You can disable cookies at any time
                through your browser settings, though some features may not function as intended.
              </p>
            </Section>

            <Section title="4. Third-Party Advertising (Google AdSense)">
              <p>
                We use <b>Google AdSense</b> to display advertisements on this site. Third-party vendors,
                including Google, use cookies to serve ads based on your prior visits to this and other websites.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on
                  your visit to Gulf-Rig and/or other sites on the Internet.
                </li>
                <li>
                  You may opt out of personalised advertising by visiting{" "}
                  <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="font-semibold underline" style={{ color: "var(--fb-blue)" }}>
                    Google Ads Settings
                  </a>.
                </li>
                <li>
                  You can also opt out of third-party vendor cookies at{" "}
                  <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="font-semibold underline" style={{ color: "var(--fb-blue)" }}>
                    www.aboutads.info
                  </a>.
                </li>
              </ul>
            </Section>

            <Section title="5. Data Sharing">
              <p>
                We do not sell your personal information. Contact details you include in a job post are
                published publicly by your own choice so that applicants can reach you. Aside from that,
                information is shared only with service providers (such as hosting and advertising partners)
                strictly to operate the site.
              </p>
            </Section>

            <Section title="6. Data Retention">
              <p>
                Job postings remain visible until removed by the poster or by an administrator. You may request
                removal of a posting or your contact information at any time by contacting us.
              </p>
            </Section>

            <Section title="7. Children's Privacy">
              <p>
                Gulf-Rig is intended for working professionals and is not directed at children under 16.
                We do not knowingly collect personal information from children.
              </p>
            </Section>

            <Section title="8. Your Rights">
              <p>
                You may request access to, correction of, or deletion of any personal information you have
                submitted. To exercise these rights, contact us using the details below.
              </p>
            </Section>

            <Section title="9. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page with
                an updated revision date.
              </p>
            </Section>

            <Section title="10. Contact Us">
              <p>
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:contact.gulfrig@gmail.com" className="font-semibold underline" style={{ color: "var(--fb-blue)" }}>
                  contact.gulfrig@gmail.com
                </a>.
              </p>
            </Section>

          </div>
        </div>

        <Link href="/" className="flex items-center justify-center gap-2 py-4 text-sm font-semibold" style={{ color: "var(--fb-blue)" }}>
          <ArrowLeft className="w-4 h-4" /> Back to all jobs
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-bold text-base mb-1.5" style={{ color: "var(--fb-text)" }}>{title}</h2>
      {children}
    </div>
  );
}
