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

  const { status, rejectReason } = await req.json();

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      student: { select: { name: true, email: true } },
      teacher: { select: { name: true, email: true, teacherProfile: { select: { phone: true } } } },
    },
  });

  if (!booking) return NextResponse.json({ message: "找不到預約" }, { status: 404 });

  const isTeacher = booking.teacherId === session.user.id;
  const isStudent = booking.studentId === session.user.id;

  if (!isTeacher && !isStudent) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  // 學生只能取消「待確認」的預約
  if (isStudent) {
    if (status !== "CANCELLED") return NextResponse.json({ message: "學生只能取消預約" }, { status: 403 });
    if (booking.status !== "PENDING") return NextResponse.json({ message: "只有待確認的預約才能取消" }, { status: 400 });
  }

  // 老師操作限制
  if (isTeacher && status === "COMPLETED" && booking.status !== "CONFIRMED") {
    return NextResponse.json({ message: "只有已確認的預約才能標記完成" }, { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status, ...(rejectReason ? { rejectReason } : {}) },
  });

  const dateStr = new Date(booking.startTime).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
  });

  // 發信通知（失敗不影響主流程）
  try {
    if (process.env.RESEND_API_KEY) {
      const studentEmail = booking.student?.email;
      const studentName = booking.student?.name;
      const teacherEmail = (booking.teacher as any)?.email;
      const teacherName = booking.teacher?.name;
      const teacherPhone = booking.teacher?.teacherProfile?.phone;

      // 老師確認/拒絕 → 通知學生
      if (isTeacher && (status === "CONFIRMED" || status === "CANCELLED") && studentEmail) {
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
                ${teacherPhone ? `<tr style="background:#f0fdf4"><td style="padding:8px;color:#666">老師電話</td><td style="padding:8px;font-weight:bold;color:#16a34a">📞 ${teacherPhone}</td></tr>` : ""}
              </table>
              ${teacherPhone ? `<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:12px 16px;margin:16px 0;border-radius:4px"><p style="margin:0;color:#15803d;font-weight:bold">請主動致電老師，討論收費方式與正式上課時間。</p></div>` : ""}
              <p>請登入 <a href="https://www.tutorlink.cc" style="color:#4f46e5">TutorLink</a> 查看更多資訊。</p>
              <p style="color:#999;font-size:12px;margin-top:24px">© 2026 TutorLink</p>
            </div>
          ` : `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
              <h2 style="color:#ef4444">預約未獲接受</h2>
              <p>親愛的 ${studentName}，您好：</p>
              <p>很抱歉，<strong>${teacherName} 老師</strong>無法接受您在 ${dateStr} 的預約。</p>
              ${rejectReason ? `<div style="background:#fef2f2;border:2px solid #ef4444;border-radius:8px;padding:16px;margin:16px 0"><p style="margin:0 0 6px;font-weight:bold;color:#dc2626">📋 老師拒絕原因：</p><p style="margin:0;color:#111;font-size:15px">${rejectReason}</p></div>` : ""}
              <p>您可以嘗試預約其他老師，或選擇不同時段。</p>
              <p>請登入 <a href="https://www.tutorlink.cc/teachers" style="color:#4f46e5">TutorLink</a> 尋找其他老師。</p>
              <p style="color:#999;font-size:12px;margin-top:24px">© 2026 TutorLink</p>
            </div>
          `,
        });
      }

      // 學生取消 → 通知老師
      if (isStudent && status === "CANCELLED" && teacherEmail) {
        await sendMail({
          to: teacherEmail,
          subject: "【TutorLink】學生已取消預約",
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
              <h2 style="color:#ef4444">預約已被取消</h2>
              <p>親愛的 ${teacherName} 老師，您好：</p>
              <p><strong>${studentName}</strong> 已取消以下預約：</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr style="background:#fef2f2"><td style="padding:8px;color:#666">原定上課時間</td><td style="padding:8px;font-weight:bold">${dateStr}</td></tr>
                <tr><td style="padding:8px;color:#666">學生姓名</td><td style="padding:8px">${studentName}</td></tr>
              </table>
              ${rejectReason ? `<div style="background:#fef2f2;border:2px solid #ef4444;border-radius:8px;padding:16px;margin:16px 0"><p style="margin:0 0 6px;font-weight:bold;color:#dc2626">📋 取消原因：</p><p style="margin:0;color:#111;font-size:15px">${rejectReason}</p></div>` : ""}
              <p>請登入 <a href="https://www.tutorlink.cc/dashboard" style="color:#4f46e5">TutorLink 控制台</a> 查看最新預約狀態。</p>
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

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ message: "找不到預約" }, { status: 404 });

  // 學生或老師本人可刪，且只能刪已完成或已取消
  const isParticipant = booking.studentId === session.user.id || booking.teacherId === session.user.id;
  if (!isParticipant)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!["COMPLETED", "CANCELLED"].includes(booking.status))
    return NextResponse.json({ message: "只能刪除已完成或已取消的預約" }, { status: 400 });

  await prisma.review.deleteMany({ where: { bookingId: id } });
  await prisma.booking.delete({ where: { id } });
  return NextResponse.json({ message: "ok" });
}
