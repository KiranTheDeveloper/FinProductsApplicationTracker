import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reminder = await prisma.reminder.update({
    where: { id },
    data: { isCompleted: true },
  });
  return NextResponse.json(reminder);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.reminder.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
