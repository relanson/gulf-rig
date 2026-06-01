import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const job = await db.jobPost.findUnique({ where: { id } });

  if (!job || job.status !== "approved") {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  await db.jobPost.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json(job);
}
