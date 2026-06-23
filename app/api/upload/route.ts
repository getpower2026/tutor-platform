import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ message: "No file" }, { status: 400 });

  try {
    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const blob = await put(`teachers/${session.user.id}_${timestamp}.${ext}`, file, {
      access: "public",
    });
    return NextResponse.json({ url: blob.url });
  } catch (err: any) {
    console.error("Blob upload error:", err);
    return NextResponse.json({ message: err?.message || String(err) }, { status: 500 });
  }
}
