import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  mobile: z.string().min(10).optional(),
  email: z.string().email().optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  type: z.enum(["PROSPECT", "EXISTING_CLIENT"]).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      enquiries: {
        include: {
          service: true,
          product: true,
          reminders: { where: { isCompleted: false }, orderBy: { dueDate: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
      },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateClientSchema.parse(body);

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.mobile && { mobile: data.mobile }),
        email: data.email || null,
        dob: data.dob || null,
        ...(data.type && { type: data.type }),
      },
    });

    return NextResponse.json(client);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
