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

  const jobs = await db.jobPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  const headers = [
    "ID", "Job Title", "Company", "Location", "Project Type", "Custom Project Type",
    "Industry", "Custom Industry",
    "Currency", "Salary", "Experience", "Qualification",
    "Poster Name", "Poster Phone", "Poster Email",
    "Status", "Posted At", "Approved At", "Applications", "Views",
  ];

  const escape = (val: string | null | undefined) => `"${String(val ?? "").replace(/"/g, '""')}"`;

  const rows = jobs.map((j) => [
    j.id,
    escape(j.jobTitle),
    escape(j.companyName),
    escape(j.location),
    j.projectType,
    escape(j.customProjectType),
    escape(j.industry),
    escape(j.customIndustry),
    j.currency,
    j.salary,
    escape(j.experience),
    escape(j.qualification),
    escape(j.posterName),
    escape(j.posterPhone),
    escape(j.posterEmail),
    j.status,
    j.createdAt.toISOString(),
    j.approvedAt?.toISOString() || "",
    (j as typeof j & { _count: { applications: number } })._count.applications,
    j.viewCount,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="gulf-rig-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
