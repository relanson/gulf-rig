"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
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
        {/* Left: Logo — acts as Home; scrolls to top if already on the feed */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            className="flex items-center gap-1.5"
            onClick={() => {
              if (pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--fb-blue)" }}>
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline font-extrabold text-lg" style={{ color: "var(--fb-blue)" }}>
              Gulf-Rig
            </span>
          </Link>
        </div>

        {/* Center: Search bar (job title → /search) */}
        <div className="flex-1 flex justify-center px-2 md:px-4">
          <Suspense fallback={<SearchBoxShell />}>
            <SearchBox />
          </Suspense>
        </div>

        {/* Right: Admin button */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <Link
            href="/admin/dashboard"
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
        {[...navTabs, { href: "/admin/dashboard", icon: Shield, label: "Admin" }].map(({ href, icon: Icon, label }) => (
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

/* ── Search box (isolated so useSearchParams sits behind a Suspense boundary) ── */
function SearchBox() {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [term, setTerm] = useState("");

  // Keep the box in sync with the URL query when on the search page.
  useEffect(() => {
    setTerm(pathname === "/search" ? params.get("q") ?? "" : "");
  }, [pathname, params]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (q.length >= 2) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={submitSearch} className="flex items-center rounded-full px-3 md:px-4 py-2 gap-2 w-full max-w-md"
      style={{ background: "var(--fb-bg)", border: "1px solid var(--fb-border)" }}>
      <button type="submit" aria-label="Search" className="shrink-0">
        <Search className="w-4 h-4" style={{ color: "var(--fb-secondary)" }} />
      </button>
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search jobs by title…"
        enterKeyHint="search"
        className="bg-transparent text-sm outline-none w-full"
        style={{ color: "var(--fb-text)" }}
      />
    </form>
  );
}

function SearchBoxShell() {
  return (
    <div className="flex items-center rounded-full px-3 md:px-4 py-2 gap-2 w-full max-w-md"
      style={{ background: "var(--fb-bg)", border: "1px solid var(--fb-border)" }}>
      <Search className="w-4 h-4 shrink-0" style={{ color: "var(--fb-secondary)" }} />
      <span className="text-sm" style={{ color: "var(--fb-secondary)" }}>Search jobs by title…</span>
    </div>
  );
}
