import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { EnquiryStatus } from "@/generated/prisma/client";

const createEnquirySchema = z.object({
  clientId: z.string().min(1),
  serviceId: z.string().min(1),
  productId: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
  premium: z.number().optional(),
  sumAssured: z.number().optional(),
  investmentAmount: z.number().optional(),
  reminderDate: z.string().optional(),
  reminderMessage: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const serviceCode = searchParams.get("service") || "";
  const status = searchParams.get("status") || "";
  const clientId = searchParams.get("clientId") || "";

  const enquiries = await prisma.enquiry.findMany({
    where: {
      ...(serviceCode ? { service: { code: serviceCode } } : {}),
      ...(status ? { status: status as EnquiryStatus } : {}),
      ...(clientId ? { clientId } : {}),
    },
    include: {
      client: true,
      service: true,
      product: true,
      reminders: {
        where: { isCompleted: false },
        orderBy: { dueDate: "asc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(enquiries);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createEnquirySchema.parse(body);

    const enquiry = await prisma.enquiry.create({
      data: {
        clientId: data.clientId,
        serviceId: data.serviceId,
        productId: data.productId || null,
        notes: data.notes || null,
        premium: data.premium || null,
        sumAssured: data.sumAssured || null,
        investmentAmount: data.investmentAmount || null,
        statusHistory: {
          create: {
            toStatus: "NEW_ENQUIRY",
            notes: "Enquiry created",
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
      include: { client: true, service: true, product: true },
    });

    // Update client type to EXISTING_CLIENT if currently PROSPECT and creating second+ enquiry
    const enquiryCount = await prisma.enquiry.count({ where: { clientId: data.clientId } });
    if (enquiryCount > 1) {
      await prisma.client.update({
        where: { id: data.clientId },
        data: { type: "EXISTING_CLIENT" },
      });
    }

    return NextResponse.json(enquiry, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create enquiry" }, { status: 500 });
  }
}
