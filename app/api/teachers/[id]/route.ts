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
      user: { select: { id: true, name: true, image: true, createdAt: true, phone: true } },
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
  const updateData: any = {};
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.subjects !== undefined) updateData.subjects = data.subjects;
  if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;
  if (data.experience !== undefined) updateData.experience = data.experience;
  if (data.education !== undefined) updateData.education = data.education;
  if (data.languages !== undefined) updateData.languages = data.languages;
  if (data.availability !== undefined) updateData.availability = data.availability;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.photoUrl !== undefined && data.photoUrl !== "" && !data.photoUrl.startsWith("blob:")) updateData.photoUrl = data.photoUrl;

  const profile = await prisma.teacherProfile.update({
    where: { userId: id },
    data: updateData,
  });

  return NextResponse.json(profile);
}
