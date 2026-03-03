import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addProductSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  name: z.string().min(1, "Product name is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = addProductSchema.parse(body);
    const product = await prisma.product.create({
      data: { serviceId: data.serviceId, name: data.name },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
