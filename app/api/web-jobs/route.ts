import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { browseWebJobs, type SearchResult } from "@/lib/jobs-api";

// Cache aggregated browse pages for 12 hours (feeds are slow; this keeps the
// home feed snappy and reduces load on the source blogs).
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));

  const cacheKey = `__browse__::${page}`;
  let results: SearchResult[] = [];
  let hasMore = false;
  let available = true;

  try {
    const cached = await db.searchCache.findUnique({ where: { id: cacheKey } });
    const fresh = cached && Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS;

    if (fresh) {
      results = JSON.parse(cached!.results) as SearchResult[];
      // hasMore: assume more pages exist unless this looks like a short tail.
      hasMore = results.length > 0 && page < 10;
    } else {
      const browsed = await browseWebJobs(page);
      results = browsed.results;
      hasMore = browsed.hasMore;
      await db.searchCache
        .upsert({
          where: { id: cacheKey },
          create: { id: cacheKey, query: "__browse__", page, results: JSON.stringify(results), totalCount: results.length },
          update: { results: JSON.stringify(results), totalCount: results.length, fetchedAt: new Date() },
        })
        .catch((e) => console.error("[web-jobs] cache write failed:", e));
    }
  } catch (e) {
    available = false;
    console.error("[web-jobs] browse unavailable:", e instanceof Error ? e.message : e);
  }

  return NextResponse.json({ page, results, hasMore, available });
}
