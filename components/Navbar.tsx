"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Home, PlusSquare, Shield, Search } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navTabs = [
    { href: "/",     icon: Home,       label: "Feed"     },
    { href: "/post", icon: PlusSquare, label: "Post Job" },
  ];

  return (
    <>
      {/* ── Desktop & Mobile top bar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white flex items-center px-4 gap-2"
        style={{ height: "var(--fb-nav-h)", borderBottom: "1px solid var(--fb-border)", boxShadow: "0 2px 4px rgba(0,0,0,.1)" }}
      >
        {/* Left: Logo */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--fb-blue)" }}>
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg" style={{ color: "var(--fb-blue)" }}>
              Gulf-Rig
            </span>
          </Link>
        </div>

        {/* Center: Search bar (desktop) */}
        <div className="flex-1 flex justify-center px-4">
          <div className="hidden md:flex items-center rounded-full px-4 py-2 gap-2 w-full max-w-md cursor-text"
            style={{ background: "var(--fb-bg)", border: "1px solid var(--fb-border)" }}>
            <Search className="w-4 h-4 shrink-0" style={{ color: "var(--fb-secondary)" }} />
            <input
              placeholder="Search Gulf-Rig"
              className="bg-transparent text-sm outline-none w-full"
              style={{ color: "var(--fb-text)" }}
            />
          </div>
        </div>

        {/* Right: Admin button */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: pathname.startsWith("/admin") ? "var(--fb-blue)" : "var(--fb-bg)",
              color: pathname.startsWith("/admin") ? "#fff" : "var(--fb-text)",
            }}
          >
            <Shield className="w-4 h-4" />
            <span className="hidden md:inline">Admin</span>
          </Link>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white flex items-center"
        style={{ borderTop: "1px solid var(--fb-border)", height: "52px" }}
      >
        {[...navTabs, { href: "/admin", icon: Shield, label: "Admin" }].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full"
            style={{
              borderTop: isActive(href) ? "3px solid var(--fb-blue)" : "3px solid transparent",
              color: isActive(href) ? "var(--fb-blue)" : "var(--fb-secondary)",
            }}
          >
            <Icon className="w-6 h-6" strokeWidth={isActive(href) ? 2.5 : 1.8} />
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
