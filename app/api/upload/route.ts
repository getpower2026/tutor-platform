import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: Request) {
  // 註冊流程中老師尚未登入就需要上傳照片，因此允許匿名上傳；
  // 已登入時仍優先用 session.user.id 命名，行為與原本一致。
  const session = await getServerSession(authOptions);

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
    const idPart = session?.user?.id ?? `anon_${randomUUID()}`;
    const filename = `${idPart}_${Date.now()}.${ext}`;
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
