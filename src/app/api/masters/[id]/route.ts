import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = z.object({ name: z.string().min(1) }).parse(body);
    const service = await prisma.service.update({
      where: { id },
      data: { name: data.name },
      include: { products: true },
    });
    return NextResponse.json(service);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const enquiryCount = await prisma.enquiry.count({ where: { serviceId: id } });
    if (enquiryCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete — ${enquiryCount} enquiry(s) are linked to this service` },
        { status: 409 }
      );
    }
    await prisma.product.deleteMany({ where: { serviceId: id } });
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
