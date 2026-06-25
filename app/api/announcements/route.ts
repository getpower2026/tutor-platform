import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "tantriswang@gmail.com";

export async function GET() {
  const latest = await prisma.announcement.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(latest);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== ADMIN_EMAIL)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ message: "請輸入公告內容" }, { status: 400 });

  const ann = await prisma.announcement.create({ data: { text: text.trim() } });
  return NextResponse.json(ann, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== ADMIN_EMAIL)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ message: "ok" });
}
