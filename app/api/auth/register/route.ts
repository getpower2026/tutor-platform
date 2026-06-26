import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { name, email, password, role, phone, bio, hourlyRate, experience, education, subjects, availability, showPhone, trialClass } = await req.json();

  const trimmedPhone = (phone || "").trim();
  if (!name || !email || !password || !trimmedPhone) {
    return NextResponse.json({ message: "請填寫所有欄位（姓名、Email、密碼、手機均為必填）" }, { status: 400 });
  }
  if (!/^[0-9\-\+\s]{8,15}$/.test(trimmedPhone)) {
    return NextResponse.json({ message: "手機號碼格式不正確（請輸入 8~15 碼數字）" }, { status: 400 });
  }

  if (role === "TEACHER") {
    if (!bio || bio.trim().length < 20) {
      return NextResponse.json({ message: "老師必須填寫個人簡介（至少 20 個字）" }, { status: 400 });
    }
    if (!hourlyRate || hourlyRate < 100) {
      return NextResponse.json({ message: "請填寫時薪（最低 100 NTD）" }, { status: 400 });
    }
    if (experience === undefined || experience === null || experience < 0) {
      return NextResponse.json({ message: "請填寫教學年資" }, { status: 400 });
    }
    if (!education || education.trim().length === 0) {
      return NextResponse.json({ message: "請填寫學歷" }, { status: 400 });
    }
    if (!subjects || subjects.length === 0) {
      return NextResponse.json({ message: "請至少選擇一個教授科目" }, { status: 400 });
    }
    if (!availability || !Object.values(availability).some(Boolean)) {
      return NextResponse.json({ message: "請至少選擇一個可授課天數" }, { status: 400 });
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "此 Email 已被註冊" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role ?? "STUDENT", phone: trimmedPhone },
  });

  if (role === "TEACHER") {
    await prisma.teacherProfile.create({
      data: {
        userId: user.id,
        bio: bio.trim(),
        subjects: subjects || [],
        hourlyRate: Number(hourlyRate),
        experience: Number(experience),
        education: education.trim(),
        languages: ["中文"],
        availability: availability || {},
        showPhone: !!showPhone,
        trialClass: !!trialClass,
        phone: trimmedPhone,
      },
    });
  }

  return NextResponse.json({ id: user.id }, { status: 201 });
}
