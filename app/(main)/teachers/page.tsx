import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TeachersClient } from "./TeachersClient";

export const metadata: Metadata = {
  title: "尋找家教老師 | TutorLink 免費家教媒合平台",
  description: "瀏覽 TutorLink 上的家教老師，涵蓋國文、英文、數學、物理、化學、生物等科目。線上一對一教學，完全免費，直接與老師聯繫預約。",
  keywords: "找家教, 家教老師, 線上家教, 一對一教學, 國文家教, 英文家教, 數學家教, 物理家教, 化學家教",
  openGraph: {
    title: "尋找家教老師 | TutorLink",
    description: "免費瀏覽各科家教老師，線上一對一教學，國小國中高中皆有。",
    url: "https://www.tutorlink.cc/teachers",
  },
};

export default async function TeachersPage() {
  const teachers = await prisma.teacherProfile.findMany({
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <TeachersClient initialTeachers={teachers} />;
}
