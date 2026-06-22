import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const maxRate = searchParams.get("maxRate");
  const q = searchParams.get("q");

  const teachers = await prisma.teacherProfile.findMany({
    where: {
      ...(subject ? { subjects: { has: subject } } : {}),
      ...(maxRate ? { hourlyRate: { lte: parseInt(maxRate) } } : {}),
      ...(q ? { user: { name: { contains: q, mode: "insensitive" } } } : {}),
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { rating: "desc" },
  });

  return NextResponse.json(teachers);
}
