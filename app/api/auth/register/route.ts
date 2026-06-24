import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { name, email, password, role, phone } = await req.json();

  const trimmedPhone = (phone || "").trim();
  if (!name || !email || !password || !trimmedPhone) {
    return NextResponse.json({ message: "請填寫所有欄位（姓名、Email、密碼、手機均為必填）" }, { status: 400 });
  }
  if (!/^[0-9\-\+\s]{8,15}$/.test(trimmedPhone)) {
    return NextResponse.json({ message: "手機號碼格式不正確（請輸入 8~15 碼數字）" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "此 Email 已被註冊" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role ?? "STUDENT", phone: trimmedPhone },
  });

  if (role === "TEACHER") {
    await prisma.teacherProfile.create({
      data: {
        userId: user.id,
        bio: "",
        subjects: [],
        hourlyRate: 500,
        experience: 0,
        education: "",
        languages: ["中文"],
        availability: {},
      },
    });
  }

  return NextResponse.json({ id: user.id }, { status: 201 });
}
