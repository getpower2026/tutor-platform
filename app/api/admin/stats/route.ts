import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "tantriswang@gmail.com";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [teachers, students, bookings] = await Promise.all([
    prisma.teacherProfile.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      include: {
        student: { select: { name: true, email: true } },
        teacher: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ teachers, students, bookings });
}
