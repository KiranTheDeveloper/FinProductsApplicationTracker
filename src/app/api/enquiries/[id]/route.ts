import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateEnquirySchema = z.object({
  productId: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
  premium: z.number().optional().nullable(),
  sumAssured: z.number().optional().nullable(),
  investmentAmount: z.number().optional().nullable(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enquiry = await prisma.enquiry.findUnique({
    where: { id },
    include: {
      client: true,
      service: true,
      product: true,
      statusHistory: { orderBy: { changedAt: "desc" } },
      reminders: { orderBy: { dueDate: "asc" } },
      documents: true,
    },
  });

  if (!enquiry) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  return NextResponse.json(enquiry);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateEnquirySchema.parse(body);

    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: {
        productId: data.productId || null,
        notes: data.notes,
        premium: data.premium,
        sumAssured: data.sumAssured,
        investmentAmount: data.investmentAmount,
      },
    });

    return NextResponse.json(enquiry);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 });
  }
}
