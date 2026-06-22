import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 清除舊資料
  await prisma.teacherProfile.deleteMany({});
  await prisma.user.deleteMany({ where: { role: "TEACHER" } });

  // Seed demo teachers
  const teachers = [
    { name: "陳小華", email: "chen@demo.com", subjects: ["數學", "物理"], hourlyRate: 600, experience: 5, bio: "台大數學系碩士，擅長用生活化例子解說抽象概念。", education: "國立台灣大學 數學研究所" },
    { name: "林美玲", email: "lin@demo.com", subjects: ["英文", "日文"], hourlyRate: 800, experience: 8, bio: "旅居日本五年，英日文皆流利，專門為考試衝刺。", education: "輔仁大學 外語學院" },
    { name: "王建國", email: "wang@demo.com", subjects: ["程式設計", "數學"], hourlyRate: 1200, experience: 10, bio: "Google 前工程師，從零教到求職面試全包辦。", education: "交通大學 資工系" },
  ];

  for (const t of teachers) {
    const hashed = await bcrypt.hash("password123", 12);
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: { name: t.name, email: t.email, password: hashed, role: "TEACHER" },
    });
    await prisma.teacherProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: t.bio,
        subjects: t.subjects,
        hourlyRate: t.hourlyRate,
        experience: t.experience,
        education: t.education,
        languages: ["中文"],
        rating: 4.8 + Math.random() * 0.2,
        reviewCount: Math.floor(Math.random() * 50) + 10,
        availability: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true },
      },
    });
  }

  console.log("✅ Seed 完成！三位示範老師已建立。");
}

main().catch(console.error).finally(() => prisma.$disconnect());
