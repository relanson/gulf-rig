import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function isAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token");
  return token?.value === process.env.ADMIN_PASSWORD;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await db.jobPost.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
