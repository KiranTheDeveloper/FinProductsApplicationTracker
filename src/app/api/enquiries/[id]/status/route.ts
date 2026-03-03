import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const statusUpdateSchema = z.object({
  status: z.string().min(1),
  notes: z.string().optional(),
  reminderDate: z.string().optional(),
  reminderMessage: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = statusUpdateSchema.parse(body);

    const current = await prisma.enquiry.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!current) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });

    const updated = await prisma.enquiry.update({
      where: { id },
      data: {
        status: data.status as "NEW_ENQUIRY" | "KYC_PENDING" | "KYC_RECEIVED" | "PRODUCT_PROPOSED" | "QUOTE_SHARED" | "CONFIRMATION_RECEIVED" | "DEAL_CLOSED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "DROPPED",
        statusHistory: {
          create: {
            fromStatus: current.status,
            toStatus: data.status,
            notes: data.notes || null,
          },
        },
        ...(data.reminderDate ? {
          reminders: {
            create: {
              dueDate: new Date(data.reminderDate),
              message: data.reminderMessage || "Follow up with client",
            },
          },
        } : {}),
      },
      include: {
        client: true,
        service: true,
        product: true,
        statusHistory: { orderBy: { changedAt: "desc" } },
        reminders: { where: { isCompleted: false }, orderBy: { dueDate: "asc" } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
