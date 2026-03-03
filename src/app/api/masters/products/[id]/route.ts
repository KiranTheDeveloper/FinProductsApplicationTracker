import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const enquiryCount = await prisma.enquiry.count({ where: { productId: id } });
    if (enquiryCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete — ${enquiryCount} enquiry(s) are linked to this product` },
        { status: 409 }
      );
    }
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
