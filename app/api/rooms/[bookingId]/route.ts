import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDailyRoom, createDailyToken } from "@/lib/daily";

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return NextResponse.json({ message: "找不到預約" }, { status: 404 });

  const isParticipant = booking.studentId === session.user.id || booking.teacherId === session.user.id;
  if (!isParticipant) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  if (booking.paymentStatus !== "PAID") {
    return NextResponse.json({ message: "尚未付款" }, { status: 402 });
  }

  // Create room if it doesn't exist
  if (!booking.dailyRoomName) {
    const room = await createDailyRoom(booking.id, booking.endTime);
    await prisma.booking.update({
      where: { id: booking.id },
      data: { dailyRoomName: room.name, dailyRoomUrl: room.url },
    });
    booking.dailyRoomName = room.name;
  }

  const isOwner = booking.teacherId === session.user.id;
  const token = await createDailyToken(booking.dailyRoomName!, isOwner);

  return NextResponse.json({ roomName: booking.dailyRoomName, token });
}
