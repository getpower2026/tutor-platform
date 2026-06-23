import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "tantriswang@gmail.com";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ message: "ok" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "刪除失敗" }, { status: 500 });
  }
}
