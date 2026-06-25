import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "tantriswang@gmail.com";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { role } = await req.json();

  if (role !== "STUDENT" && role !== "TEACHER") {
    return NextResponse.json({ message: "無效的 role" }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data: { role } });

  if (role === "TEACHER") {
    const existing = await prisma.teacherProfile.findUnique({ where: { userId: id } });
    if (!existing) {
      await prisma.teacherProfile.create({
        data: {
          userId: id,
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
  } else {
    await prisma.teacherProfile.deleteMany({ where: { userId: id } });
  }

  return NextResponse.json({ message: "ok" });
}

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
