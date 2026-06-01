import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function isAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token");
  return token?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "all";

  const where = status !== "all" ? { status } : {};

  const jobs = await db.jobPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { applications: true } },
    },
  });

  return NextResponse.json(jobs);
}
