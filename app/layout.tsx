import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Gulf-Rig — Oil & Gas Industry Jobs",
  description: "Find and post oil & gas jobs across the Gulf region and worldwide. No login required.",
};

// ✏️  Replace with your real AdSense Publisher ID once your site is approved.
const ADSENSE_PUB_ID = "ca-pub-1550416832618336";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen" style={{ background: "var(--fb-bg)" }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
