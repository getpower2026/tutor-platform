import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await prisma.teacherProfile.findFirst({
    where: { userId: id },
    include: {
      user: { select: { id: true, name: true, image: true, createdAt: true } },
    },
  });

  if (!profile) return NextResponse.json({ message: "找不到老師" }, { status: 404 });
  return NextResponse.json(profile);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const profile = await prisma.teacherProfile.update({
    where: { userId: id },
    data: {
      bio: data.bio,
      subjects: data.subjects,
      hourlyRate: data.hourlyRate,
      experience: data.experience,
      education: data.education,
      languages: data.languages,
      availability: data.availability,
      phone: data.phone,
      photoUrl: data.photoUrl,
    },
  });

  return NextResponse.json(profile);
}
