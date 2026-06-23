import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ message: "請輸入 Email" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  // always return success to avoid email enumeration
  if (!user) return NextResponse.json({ message: "ok" });

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.user.update({
    where: { email },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  if (process.env.RESEND_API_KEY) {
    const resetUrl = `https://www.tutorlink.cc/reset-password/${token}`;
    await sendMail({
      to: email,
      subject: "【TutorLink】重設密碼",
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
          <h2 style="color:#4f46e5">重設您的密碼</h2>
          <p>您好，${user.name}！</p>
          <p>我們收到了重設密碼的申請，請點擊下方按鈕設定新密碼：</p>
          <a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">重設密碼</a>
          <p style="color:#666;font-size:14px">此連結將在 <strong>1 小時</strong>後失效。</p>
          <p style="color:#666;font-size:14px">如果您沒有申請重設密碼，請忽略此信件。</p>
          <p style="color:#999;font-size:12px;margin-top:24px">© 2026 TutorLink</p>
        </div>
      `,
    }).catch(() => {});
  }

  return NextResponse.json({ message: "ok" });
}
