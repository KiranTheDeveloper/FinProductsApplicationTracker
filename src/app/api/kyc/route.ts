import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const clientId = formData.get("clientId") as string;
    const documentType = formData.get("documentType") as string;
    const enquiryId = formData.get("enquiryId") as string | null;

    if (!file || !clientId || !documentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", clientId);
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop();
    const fileName = `${documentType.replace(/\s+/g, "_")}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const relativePath = `/uploads/${clientId}/${fileName}`;

    const doc = await prisma.kYCDocument.create({
      data: {
        clientId,
        enquiryId: enquiryId || null,
        documentType,
        fileName: file.name,
        filePath: relativePath,
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    console.error("KYC upload error:", err);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.kYCDocument.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
