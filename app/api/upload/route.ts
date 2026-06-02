import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!ALLOWED.includes(file.type))
      return NextResponse.json({ error: "Only JPG, PNG, WEBP and GIF images are allowed" }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "File size must be under 10 MB" }, { status: 400 });

    // Production: use Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`uploads/${Date.now()}-${file.name}`, file, { access: "public" });
      return NextResponse.json({ url: blob.url });
    }

    // Local dev fallback: save to /public/uploads/
    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext    = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fname  = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const dir    = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fname), buffer);
    return NextResponse.json({ url: `/uploads/${fname}` });

  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
