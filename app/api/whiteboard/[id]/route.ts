import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");

  const row = await prisma.whiteboardData.findUnique({ where: { bookingId_page: { bookingId: id, page } } });
  return NextResponse.json({ data: row?.data || "", updatedAt: row?.updatedAt?.getTime() || 0 });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const { data } = await req.json();

  await prisma.whiteboardData.upsert({
    where: { bookingId_page: { bookingId: id, page } },
    update: { data },
    create: { bookingId: id, page, data },
  });

  return NextResponse.json({ ok: true });
}

// 取得這個 booking 共有幾頁
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rows = await prisma.whiteboardData.findMany({
    where: { bookingId: id },
    select: { page: true },
    orderBy: { page: "asc" },
  });
  const pages = rows.map((r) => r.page);
  return NextResponse.json({ pages: pages.length > 0 ? pages : [1] });
}
