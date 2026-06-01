import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  if (!body.name || !body.phone || !body.email) {
    return NextResponse.json(
      { error: "Name, phone and email are required" },
      { status: 400 }
    );
  }

  const job = await db.jobPost.findUnique({ where: { id } });
  if (!job || job.status !== "approved") {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const application = await db.jobApplication.create({
    data: {
      jobPostId: id,
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email.trim(),
      resumeLink: body.resumeLink?.trim() || null,
      message: body.message?.trim() || null,
    },
  });

  return NextResponse.json(
    { success: true, id: application.id },
    { status: 201 }
  );
}
