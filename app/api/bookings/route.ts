import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPaymentIntent } from "@/lib/stripe";
import { PLATFORM_FEE_PERCENT } from "@/lib/stripe";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const isTeacher = session.user.role === "TEACHER";

  const bookings = await prisma.booking.findMany({
    where: isTeacher
      ? { teacherId: session.user.id }
      : { studentId: session.user.id },
    include: {
      student: { select: { name: true, image: true } },
      teacher: { select: { name: true, image: true } },
    },
    orderBy: { startTime: "desc" },
  });

  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { teacherId, startTime, endTime, note } = await req.json();

  const teacher = await prisma.teacherProfile.findFirst({ where: { userId: teacherId } });
  if (!teacher) return NextResponse.json({ message: "找不到老師" }, { status: 404 });

  const hours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 3600000;
  const totalAmount = Math.round(teacher.hourlyRate * hours);
  const platformFee = Math.round(totalAmount * (PLATFORM_FEE_PERCENT / 100));

  const booking = await prisma.booking.create({
    data: {
      studentId: session.user.id,
      teacherId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      totalAmount,
      platformFee,
      note,
    },
  });

  try {
    const paymentIntent = await createPaymentIntent(
      totalAmount,
      booking.id,
      teacher.stripeAccountId ?? undefined
    );

    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      booking,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    // 刪除建立失敗的預約
    await prisma.booking.delete({ where: { id: booking.id } });
    return NextResponse.json({ message: err.message || "付款建立失敗" }, { status: 500 });
  }
}
