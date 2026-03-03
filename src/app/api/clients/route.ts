import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobile: z.string().min(10, "Valid mobile number required"),
  email: z.string().email().optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  type: z.enum(["PROSPECT", "EXISTING_CLIENT"]).default("PROSPECT"),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";

  const clients = await prisma.client.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { name: { contains: search } },
            { mobile: { contains: search } },
            { email: { contains: search } },
          ],
        } : {},
        type ? { type: type as "PROSPECT" | "EXISTING_CLIENT" } : {},
      ],
    },
    include: {
      enquiries: {
        include: { service: true },
        orderBy: { updatedAt: "desc" },
      },
      _count: { select: { enquiries: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createClientSchema.parse(body);

    const client = await prisma.client.create({
      data: {
        name: data.name,
        mobile: data.mobile,
        email: data.email || null,
        dob: data.dob || null,
        type: data.type,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    const error = err as { code?: string; meta?: { target?: string[] } };
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A client with this mobile number already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
