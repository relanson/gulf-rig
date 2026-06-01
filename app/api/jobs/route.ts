import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page        = parseInt(searchParams.get("page")  || "1");
  const limit       = parseInt(searchParams.get("limit") || "10");
  const projectType = searchParams.get("projectType") || "";
  const skip        = (page - 1) * limit;

  const where = {
    status: "approved",
    ...(projectType && projectType !== "all" ? { projectType } : {}),
  };

  const [jobs, total] = await Promise.all([
    db.jobPost.findMany({ where, orderBy: { approvedAt: "desc" }, skip, take: limit }),
    db.jobPost.count({ where }),
  ]);

  return NextResponse.json({ jobs, total, hasMore: skip + jobs.length < total, page });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.companyName?.trim()) {
      return NextResponse.json({ error: "Please enter the company or employer name." }, { status: 400 });
    }
    if (!body.posterName?.trim()) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!body.posterEmail?.trim()) {
      return NextResponse.json({ error: "Please enter your email address." }, { status: 400 });
    }

    // Auto-detect postType from what was provided
    const hasImage = !!body.imageUrl;
    const hasDesc  = !!body.description?.trim();
    const postType = hasImage && hasDesc ? "image_with_caption"
                   : hasImage            ? "image_only"
                   : "caption_only";

    const job = await db.jobPost.create({
      data: {
        postType,
        imageUrl:          body.imageUrl || null,
        jobTitle:          body.jobTitle?.trim()       || "",
        description:       body.description?.trim()    || null,
        projectType:       body.projectType?.trim()     || "",
        customProjectType: body.projectType === "other" ? (body.customProjectType?.trim() || null) : null,
        industry:          body.industry?.trim()       || null,
        customIndustry:    body.industry === "other"   ? (body.customIndustry?.trim() || null) : null,
        currency:          body.currency               || "USD",
        salary:            body.salary?.trim()         || "",
        experience:        body.experience?.trim()     || "",
        qualification:     body.qualification?.trim()  || "",
        location:          body.location?.trim()       || "",
        companyName:       body.companyName?.trim()    || "",
        posterName:        body.posterName?.trim()     || null,
        posterPhone:       body.posterPhone?.trim()    || null,
        posterEmail:       body.posterEmail?.trim()    || null,
      },
    });

    return NextResponse.json({ success: true, id: job.id }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/jobs]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
