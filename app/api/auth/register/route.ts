import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, password, role } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ message: "請填寫所有欄位" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "此 Email 已被註冊" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role ?? "STUDENT" },
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
