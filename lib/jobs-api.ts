// External job search via free RSS/JSON feeds from Gulf oil & gas job blogs.
// No API key, no card, no signup. Feeds are built for syndication (ToS-friendly).
// Each result's "Apply Now" links to the source post (same model as posted jobs).

/** Unified shape used by both local DB jobs and external web results. */
export interface SearchResult {
  source: "local" | "web";
  id?: string;          // present for local jobs (for /job/[id])
  jobTitle: string;
  company: string;
  location: string;
  snippet: string;      // short description / excerpt
  salary?: string;
  applyUrl: string;     // "Apply Now" target (external link or local sourceUrl)
  detailUrl?: string;   // internal detail page for local jobs
  provider?: string;    // which blog the job was found on
  updated?: string;     // ISO date string when available
}

type FeedType = "wordpress" | "blogger";

interface FeedSource {
  name: string;
  base: string;
  type: FeedType;
}

// Add/remove Gulf oil & gas job blogs here. WordPress = ?s= search feed;
// Blogger = ?q= JSON feed. Both are public, free, no key.
const SOURCES: FeedSource[] = [
  { name: "Assignments Abroad Times", base: "https://assignmentsabroadtimes.in", type: "wordpress" },
  { name: "Gulf Job Find",            base: "https://www.gulfjobfind.com",        type: "blogger" },
  { name: "Connecting Abroad",        base: "https://www.connectingabroad.online", type: "blogger" },
  { name: "Gulf Job Paper",           base: "https://www.gulfjobpaper.com",        type: "wordpress" },
];

const PER_SOURCE = 10;
const FETCH_TIMEOUT_MS = 7000;

/** Decode HTML entities (numeric + common named) and strip tags. */
function decodeAndStrip(input: string | undefined): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Detect a Gulf/Mideast/Africa location from a post title, if present. */
const LOCATIONS = [
  "Qatar", "Saudi Arabia", "Saudi", "UAE", "Abu Dhabi", "Dubai", "Kuwait",
  "Oman", "Bahrain", "Iraq", "Libya", "Angola", "Africa", "Nigeria",
  "Kazakhstan", "Algeria", "Egypt",
];
function detectLocation(title: string): string {
  const hit = LOCATIONS.find((l) => new RegExp(`\\b${l}\\b`, "i").test(title));
  return hit || "";
}

/** Skip daily-roundup / index posts that match everything. */
function isNoise(title: string): boolean {
  return /assignments?\s+abroad\s+times/i.test(title) || title.trim().length < 6;
}

// Oil & gas role/industry keywords. Used when BROWSING latest posts (no search
// query) to keep the home feed on-topic — blogs also post nursing/retail/etc.
const RELEVANT = [
  "oil", "gas", "refinery", "refineries", "petrochem", "petroleum", "fertilizer",
  "lng", "fpso", "offshore", "onshore", "rig", "drilling", "shutdown", "turnaround",
  "commission", "plant", "pipeline", "piping", "instrument", "mechanical",
  "electrical", "welder", "fitter", "rigger", "scaffolder", "technician", "foreman",
  "supervisor", "rotating", "qa/qc", "qaqc", "ndt", "inspector", "hse", "safety",
  "fabricat", "construction", "maintenance", "process", "operator", "engineer",
  "millwright", "boiler", "valve", "turbine", "compressor", "epc", "petrochemical",
];
function isRelevant(title: string, snippet = ""): boolean {
  const hay = `${title} ${snippet}`.toLowerCase();
  return RELEVANT.some((k) => hay.includes(k));
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GulfRigBot/1.0)" },
      cache: "no-store",
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(t);
  }
}

/** Parse a WordPress RSS2 feed body into normalized results. */
function parseWordpressXml(xml: string, src: FeedSource): SearchResult[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, PER_SOURCE);
  return items.map((m) => {
    const block = m[1];
    const rawTitle = (block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1] || "";
    const link     = (block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "";
    const descRaw  = (block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1] || "";
    const pubDate  = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || "";
    const title = decodeAndStrip(rawTitle);
    return {
      source: "web" as const,
      jobTitle: title,
      company: "",
      location: detectLocation(title),
      snippet: decodeAndStrip(descRaw).slice(0, 240),
      applyUrl: link.trim(),
      provider: src.name,
      updated: pubDate ? new Date(pubDate).toISOString() : undefined,
    };
  }).filter((r) => r.applyUrl && !isNoise(r.jobTitle));
}

/** Parse a Blogger JSON feed body into normalized results. */
function parseBloggerJson(json: unknown, src: FeedSource): SearchResult[] {
  const entries = (json as { feed?: { entry?: Record<string, unknown>[] } })?.feed?.entry || [];
  return entries.map((e): SearchResult => {
    const title = decodeAndStrip((e.title as { $t?: string })?.$t || "");
    const links = (e.link as { rel: string; href: string }[]) || [];
    const link  = links.find((l) => l.rel === "alternate")?.href || "";
    const content = (e.content as { $t?: string })?.$t || (e.summary as { $t?: string })?.$t || "";
    const updated = (e.published as { $t?: string })?.$t || (e.updated as { $t?: string })?.$t;
    return {
      source: "web",
      jobTitle: title,
      company: "",
      location: detectLocation(title),
      snippet: decodeAndStrip(content).slice(0, 240),
      applyUrl: link,
      provider: src.name,
      updated: updated || undefined,
    };
  }).filter((r: SearchResult) => r.applyUrl && !isNoise(r.jobTitle));
}

async function searchWordpress(src: FeedSource, q: string, page: number): Promise<SearchResult[]> {
  const url = `${src.base}/?s=${encodeURIComponent(q)}&feed=rss2&paged=${page}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  return parseWordpressXml(await res.text(), src);
}

async function searchBlogger(src: FeedSource, q: string, page: number): Promise<SearchResult[]> {
  const start = (page - 1) * PER_SOURCE + 1;
  const url = `${src.base}/feeds/posts/default?q=${encodeURIComponent(q)}&alt=json&max-results=${PER_SOURCE}&start-index=${start}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  return parseBloggerJson(await res.json(), src);
}

// ── Browse: pull LATEST posts (no query) for the home-feed "More jobs" section ──

async function browseWordpress(src: FeedSource, page: number): Promise<SearchResult[]> {
  const url = `${src.base}/feed/?paged=${page}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  return parseWordpressXml(await res.text(), src);
}

async function browseBlogger(src: FeedSource, page: number): Promise<SearchResult[]> {
  const start = (page - 1) * PER_SOURCE + 1;
  const url = `${src.base}/feeds/posts/default?alt=json&max-results=${PER_SOURCE}&start-index=${start}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  return parseBloggerJson(await res.json(), src);
}

/**
 * Aggregate search across all feed sources in parallel.
 * Throws only if every source fails — callers degrade to local-only.
 */
export async function searchWebJobs(
  query: string,
  page: number
): Promise<{ results: SearchResult[]; hasMore: boolean }> {
  const settled = await Promise.allSettled(
    SOURCES.map((src) =>
      src.type === "wordpress"
        ? searchWordpress(src, query, page)
        : searchBlogger(src, query, page)
    )
  );

  const ok = settled.filter((s) => s.status === "fulfilled");
  if (ok.length === 0) throw new Error("All feed sources failed");

  // Interleave sources so no single blog dominates the top of the list.
  const perSource = ok.map((s) => (s as PromiseFulfilledResult<SearchResult[]>).value);
  const merged: SearchResult[] = [];
  const maxLen = Math.max(0, ...perSource.map((a) => a.length));
  for (let i = 0; i < maxLen; i++) {
    for (const arr of perSource) if (arr[i]) merged.push(arr[i]);
  }

  // Dedupe by apply URL.
  const seen = new Set<string>();
  const results = merged.filter((r) => {
    if (seen.has(r.applyUrl)) return false;
    seen.add(r.applyUrl);
    return true;
  });

  // A full page from any source suggests more may exist.
  const hasMore = perSource.some((a) => a.length >= PER_SOURCE);
  return { results, hasMore };
}

// Cap how deep the home-feed browse can scroll (each blog's feed is finite).
const MAX_BROWSE_PAGE = 10;

/**
 * Browse the latest oil & gas posts across all feed sources (no search query).
 * Powers the "More Oil & Gas Jobs from Around the Gulf" home-feed section.
 * Interleaves + dedupes like searchWebJobs, plus an on-topic relevance filter.
 */
export async function browseWebJobs(
  page: number
): Promise<{ results: SearchResult[]; hasMore: boolean }> {
  if (page > MAX_BROWSE_PAGE) return { results: [], hasMore: false };

  const settled = await Promise.allSettled(
    SOURCES.map((src) =>
      src.type === "wordpress" ? browseWordpress(src, page) : browseBlogger(src, page)
    )
  );

  const ok = settled.filter((s) => s.status === "fulfilled");
  if (ok.length === 0) throw new Error("All feed sources failed");

  const perSource = ok.map((s) =>
    (s as PromiseFulfilledResult<SearchResult[]>).value.filter((r) => isRelevant(r.jobTitle, r.snippet))
  );

  // Interleave so no single blog dominates.
  const merged: SearchResult[] = [];
  const maxLen = Math.max(0, ...perSource.map((a) => a.length));
  for (let i = 0; i < maxLen; i++) {
    for (const arr of perSource) if (arr[i]) merged.push(arr[i]);
  }

  // Dedupe by apply URL.
  const seen = new Set<string>();
  const results = merged.filter((r) => {
    if (seen.has(r.applyUrl)) return false;
    seen.add(r.applyUrl);
    return true;
  });

  // More pages likely exist if any source returned a full page AND we're under the cap.
  const rawHasMore = ok.some(
    (s) => (s as PromiseFulfilledResult<SearchResult[]>).value.length >= PER_SOURCE
  );
  const hasMore = rawHasMore && page < MAX_BROWSE_PAGE;
  return { results, hasMore };
}
