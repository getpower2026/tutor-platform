import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { bookingId, rating, comment } = await req.json();
  if (!bookingId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ message: "資料不完整" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  });

  if (!booking) return NextResponse.json({ message: "找不到預約" }, { status: 404 });
  if (booking.studentId !== session.user.id) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (booking.status !== "COMPLETED" && booking.status !== "CONFIRMED") {
    return NextResponse.json({ message: "課程尚未完成" }, { status: 400 });
  }
  if (booking.review) return NextResponse.json({ message: "已評價過" }, { status: 400 });

  const review = await prisma.review.create({
    data: {
      bookingId,
      reviewerId: session.user.id,
      teacherId: booking.teacherId,
      rating,
      comment: comment || "",
    },
  });

  // 重新計算老師平均評分
  const allReviews = await prisma.review.findMany({
    where: { teacherId: booking.teacherId },
    select: { rating: true },
  });
  const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await prisma.teacherProfile.update({
    where: { userId: booking.teacherId },
    data: { rating: avg, reviewCount: allReviews.length },
  });

  return NextResponse.json(review);
}
