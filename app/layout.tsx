import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Gulf-Rig — Oil & Gas Industry Jobs",
  description: "Find and post oil & gas jobs across the Gulf region and worldwide. No login required.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: "var(--fb-bg)" }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
