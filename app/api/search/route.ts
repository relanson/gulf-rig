import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { searchWebJobs, type SearchResult } from "@/lib/jobs-api";

// Cache external results for 12 hours to protect the free-tier quota.
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const LOCAL_LIMIT = 12;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q    = (searchParams.get("q") || "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));

  if (q.length < 2) {
    return NextResponse.json({ error: "Enter at least 2 characters." }, { status: 400 });
  }

  const cacheKey = `${q.toLowerCase()}::${page}`;
  let webResults: SearchResult[] = [];
  let webHasMore = false;
  let webAvailable = true;

  // ── 1. Local matches (only mixed in on page 1) ──
  let localResults: SearchResult[] = [];
  if (page === 1) {
    try {
      const jobs = await db.jobPost.findMany({
        where: {
          status: "approved",
          OR: [
            { jobTitle: { contains: q } },
            { description: { contains: q } },
            { companyName: { contains: q } },
            { location: { contains: q } },
            { industry: { contains: q } },
            { customIndustry: { contains: q } },
          ],
        },
        orderBy: { approvedAt: "desc" },
        take: LOCAL_LIMIT,
      });

      localResults = jobs.map((job) => ({
        source: "local" as const,
        id: job.id,
        jobTitle: job.jobTitle || "Job Opening",
        company: job.companyName,
        location: job.location,
        snippet: (job.description || "").slice(0, 280),
        salary: job.salary ? `${job.currency} ${job.salary}` : undefined,
        applyUrl: job.sourceUrl || `/job/${job.id}`,
        detailUrl: `/job/${job.id}`,
      }));
    } catch (e) {
      console.error("[search] local query failed:", e);
    }
  }

  // ── 2. Web results: cache lookup → Jooble on miss ──
  try {
    const cached = await db.searchCache.findUnique({ where: { id: cacheKey } });
    const fresh = cached && Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS;

    if (fresh) {
      webResults = JSON.parse(cached!.results) as SearchResult[];
    } else {
      const { results } = await searchWebJobs(q, page);
      webResults = results;
      // Store/refresh the cache (best-effort).
      await db.searchCache.upsert({
        where: { id: cacheKey },
        create: { id: cacheKey, query: q, page, results: JSON.stringify(results), totalCount: results.length },
        update: { results: JSON.stringify(results), totalCount: results.length, fetchedAt: new Date() },
      }).catch((e) => console.error("[search] cache write failed:", e));
    }
    webHasMore = webResults.length >= 10;
  } catch (e) {
    // Missing key or API failure → degrade to local-only.
    webAvailable = false;
    console.error("[search] web search unavailable:", e instanceof Error ? e.message : e);
  }

  // ── 3. Merge: local first on page 1, web fills the rest ──
  const results = page === 1 ? [...localResults, ...webResults] : webResults;
  const hasMore = webHasMore;

  return NextResponse.json({
    query: q,
    page,
    results,
    hasMore,
    webAvailable,
    localCount: localResults.length,
    webCount: webResults.length,
  });
}
