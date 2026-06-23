import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const row = await prisma.whiteboardData.findUnique({ where: { bookingId: id } });
  return NextResponse.json({ data: row?.data || "", updatedAt: row?.updatedAt?.getTime() || 0 });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { data } = await req.json();

  await prisma.whiteboardData.upsert({
    where: { bookingId: id },
    update: { data },
    create: { bookingId: id, data },
  });

  return NextResponse.json({ ok: true });
}
