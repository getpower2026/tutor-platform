import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ message: "資料不完整" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ message: "密碼至少 8 個字元" }, { status: 400 });

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) return NextResponse.json({ message: "連結已失效或無效，請重新申請" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExpiry: null },
  });

  return NextResponse.json({ message: "ok" });
}
