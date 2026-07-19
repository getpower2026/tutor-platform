import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ message: "No file" }, { status: 400 });

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ message: "圖片大小不能超過 2MB，請壓縮後再上傳" }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ message: "只支援 JPG、PNG、WebP 格式" }, { status: 400 });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
    const filename = `${session.user.id}_${Date.now()}.${ext}`;
    const buffer = await file.arrayBuffer();

    const { error } = await supabase.storage
      .from("teacher-photos")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("teacher-photos").getPublicUrl(filename);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ message: err?.message || String(err) }, { status: 500 });
  }
}
