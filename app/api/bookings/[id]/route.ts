import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, name: true, image: true } },
      teacher: {
        select: {
          id: true, name: true, image: true,
          teacherProfile: { select: { phone: true, photoUrl: true } },
        },
      },
    },
  });

  if (!booking) return NextResponse.json({ message: "找不到預約" }, { status: 404 });

  const isParticipant = booking?.studentId === session.user.id || booking?.teacherId === session.user.id;
  if (!isParticipant) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  return NextResponse.json(booking);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { status } = await req.json();

  // 只有老師可以接受/拒絕
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      student: { select: { name: true, email: true } },
      teacher: { select: { name: true } },
      teacherProfile: false,
    } as any,
  });

  if (!booking) return NextResponse.json({ message: "找不到預約" }, { status: 404 });
  if (booking.teacherId !== session.user.id) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const updated = await prisma.booking.update({
    where: { id },
    data: { status },
  });

  // 發信通知學生（失敗不影響主流程）
  try {
    if (process.env.RESEND_API_KEY && (status === "CONFIRMED" || status === "CANCELLED")) {
      const studentEmail = (booking as any).student?.email;
      const studentName = (booking as any).student?.name;
      const teacherName = (booking as any).teacher?.name;
      const dateStr = new Date(booking.startTime).toLocaleString("zh-TW", {
        timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
      });
      if (studentEmail) {
        await sendMail({
          to: studentEmail,
          subject: status === "CONFIRMED" ? "【TutorLink】老師已接受您的預約！" : "【TutorLink】預約未獲接受",
          html: status === "CONFIRMED" ? `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
              <h2 style="color:#4f46e5">您的預約已確認！</h2>
              <p>親愛的 ${studentName}，您好：</p>
              <p><strong>${teacherName} 老師</strong>已接受您的預約，請盡快與老師聯繫確認上課細節。</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr><td style="padding:8px;color:#666">上課時間</td><td style="padding:8px;font-weight:bold">${dateStr}</td></tr>
              </table>
              <p>請登入 <a href="https://www.tutorlink.cc" style="color:#4f46e5">TutorLink</a> 查看老師聯絡方式。</p>
              <p style="color:#999;font-size:12px;margin-top:24px">© 2026 TutorLink</p>
            </div>
          ` : `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
              <h2 style="color:#ef4444">預約未獲接受</h2>
              <p>親愛的 ${studentName}，您好：</p>
              <p>很抱歉，<strong>${teacherName} 老師</strong>無法接受您在 ${dateStr} 的預約。</p>
              <p>您可以嘗試預約其他老師，或選擇不同時段。</p>
              <p>請登入 <a href="https://www.tutorlink.cc/teachers" style="color:#4f46e5">TutorLink</a> 尋找其他老師。</p>
              <p style="color:#999;font-size:12px;margin-top:24px">© 2026 TutorLink</p>
            </div>
          `,
        });
      }
    }
  } catch (e) {
    console.error("寄信失敗:", e);
  }

  return NextResponse.json(updated);
}
