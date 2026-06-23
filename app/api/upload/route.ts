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

  const ext = file.name.split(".").pop();
  const blob = await put(`teachers/${session.user.id}.${ext}`, file, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
