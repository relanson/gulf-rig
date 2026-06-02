import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Gulf-Rig — Oil & Gas Industry Jobs",
  description: "Find and post oil & gas jobs across the Gulf region and worldwide. No login required.",
  other: {
    // Google AdSense site verification meta tag
    "google-adsense-account": "ca-pub-1550416832618336",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* AdSense script — inline so Google crawler sees it in raw HTML */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1550416832618336"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen" style={{ background: "var(--fb-bg)" }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
