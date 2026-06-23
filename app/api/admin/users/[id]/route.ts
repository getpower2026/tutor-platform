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
    // 先刪 Review（依附在 Booking 上）
    const bookings = await prisma.booking.findMany({
      where: { OR: [{ studentId: id }, { teacherId: id }] },
      select: { id: true },
    });
    const bookingIds = bookings.map((b) => b.id);
    await prisma.review.deleteMany({ where: { OR: [{ bookingId: { in: bookingIds } }, { reviewerId: id }, { teacherId: id }] } });
    await prisma.booking.deleteMany({ where: { OR: [{ studentId: id }, { teacherId: id }] } });
    await prisma.teacherProfile.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "ok" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "刪除失敗" }, { status: 500 });
  }
}
