import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createReminderSchema = z.object({
  enquiryId: z.string().min(1),
  dueDate: z.string().min(1),
  message: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "all"; // overdue | today | upcoming | all

  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  let where = {};
  if (filter === "overdue") {
    where = { isCompleted: false, dueDate: { lt: now } };
  } else if (filter === "today") {
    where = { isCompleted: false, dueDate: { gte: now, lte: todayEnd } };
  } else if (filter === "upcoming") {
    where = { isCompleted: false, dueDate: { gt: todayEnd } };
  } else {
    where = { isCompleted: false };
  }

  const reminders = await prisma.reminder.findMany({
    where,
    include: {
      enquiry: {
        include: { client: true, service: true, product: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(reminders);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createReminderSchema.parse(body);

    const reminder = await prisma.reminder.create({
      data: {
        enquiryId: data.enquiryId,
        dueDate: new Date(data.dueDate),
        message: data.message,
      },
      include: {
        enquiry: { include: { client: true, service: true } },
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
