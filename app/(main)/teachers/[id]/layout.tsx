import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const profile = await prisma.teacherProfile.findFirst({
    where: { userId: id },
    include: { user: { select: { name: true } } },
  });

  if (!profile) return { title: "老師頁面 | TutorLink" };

  const name = profile.user.name;
  const subjects = profile.subjects.slice(0, 4).join("、");
  const desc = profile.bio
    ? profile.bio.slice(0, 120)
    : `${name} 老師提供線上一對一家教，教授 ${subjects} 等科目。`;

  return {
    title: `${name} 老師 | TutorLink 家教平台`,
    description: desc,
    openGraph: {
      title: `${name} 老師 | TutorLink`,
      description: desc,
      url: `https://www.tutorlink.cc/teachers/${id}`,
    },
  };
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return children;
}
