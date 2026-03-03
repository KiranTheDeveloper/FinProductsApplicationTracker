import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const services = await prisma.service.findMany({
    include: { products: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(services);
}

const addServiceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").toUpperCase(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = addServiceSchema.parse(body);
    const service = await prisma.service.create({
      data: { name: data.name, code: data.code },
      include: { products: true },
    });
    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    const e = err as { code?: string };
    if (e.code === "P2002") {
      return NextResponse.json({ error: "A service with this code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
