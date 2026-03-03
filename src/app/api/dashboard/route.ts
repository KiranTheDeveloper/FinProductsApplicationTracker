import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const [
    totalClients,
    activeEnquiries,
    kycPending,
    dealsThisMonth,
    overdueReminders,
    todayReminders,
    recentActivity,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.enquiry.count({
      where: {
        status: { notIn: ["COMPLETED", "DROPPED"] },
      },
    }),
    prisma.enquiry.count({ where: { status: "KYC_PENDING" } }),
    prisma.enquiry.count({
      where: {
        status: { in: ["DEAL_CLOSED", "COMPLETED"] },
        updatedAt: { gte: startOfMonth },
      },
    }),
    prisma.reminder.findMany({
      where: { isCompleted: false, dueDate: { lt: now } },
      include: { enquiry: { include: { client: true, service: true } } },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    prisma.reminder.findMany({
      where: { isCompleted: false, dueDate: { gte: now, lte: todayEnd } },
      include: { enquiry: { include: { client: true, service: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.statusHistory.findMany({
      include: {
        enquiry: { include: { client: true, service: true } },
      },
      orderBy: { changedAt: "desc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    stats: { totalClients, activeEnquiries, kycPending, dealsThisMonth },
    overdueReminders,
    todayReminders,
    recentActivity,
  });
}
