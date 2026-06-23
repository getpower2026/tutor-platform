import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPaymentIntent } from "@/lib/stripe";
import { PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import { Resend } from "resend";

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

  const teacher = await prisma.teacherProfile.findFirst({
    where: { userId: teacherId },
    include: { user: { select: { email: true, name: true } } },
  });
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

    // 發信通知老師
    const teacherEmail = (teacher as any).user?.email;
    if (teacherEmail && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const start = new Date(startTime);
      const dateStr = start.toLocaleString("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
      await resend.emails.send({
        from: "TutorLink <onboarding@resend.dev>",
        to: teacherEmail,
        subject: "【TutorLink】您有新的預約通知",
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
            <h2 style="color:#4f46e5">您有新的上課預約！</h2>
            <p>親愛的 ${(teacher as any).user?.name} 老師，您好：</p>
            <p>有學生預約了您的課程，詳情如下：</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px;color:#666">上課時間</td><td style="padding:8px;font-weight:bold">${dateStr}</td></tr>
              <tr style="background:#f9fafb"><td style="padding:8px;color:#666">課程費用</td><td style="padding:8px;font-weight:bold">NT$ ${totalAmount}</td></tr>
              ${note ? `<tr><td style="padding:8px;color:#666">學生備註</td><td style="padding:8px">${note}</td></tr>` : ""}
            </table>
            <p>請登入 <a href="https://www.tutorlink.cc" style="color:#4f46e5">TutorLink</a> 查看預約詳情。</p>
            <p style="color:#999;font-size:12px;margin-top:24px">© 2026 TutorLink</p>
          </div>
        `,
      }).catch(() => {}); // 發信失敗不影響預約流程
    }

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
