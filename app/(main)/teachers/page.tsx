import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TeachersClient } from "./TeachersClient";

export const metadata: Metadata = {
  title: "找家教老師｜線上一對一家教，免費媒合 | TutorLink",
  description: "免費找線上家教老師，國小、國中、高中各科一對一教學。數學家教、英文家教、理化家教，直接聯繫老師，不收任何費用。",
  keywords: "找家教,家教老師,線上家教,一對一家教,線上一對一,國中家教,高中家教,數學家教,英文家教,理化家教,免費家教,線上補習",
  openGraph: {
    title: "找家教老師｜線上一對一家教，免費媒合 | TutorLink",
    description: "免費找線上家教老師，國小國中高中各科一對一教學，直接聯繫老師。",
    url: "https://www.tutorlink.cc/teachers",
  },
};

export const revalidate = 5;

export default async function TeachersPage() {
  const teachers = await prisma.teacherProfile.findMany({
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <TeachersClient initialTeachers={teachers} />;
}
