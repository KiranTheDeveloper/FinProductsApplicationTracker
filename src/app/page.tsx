export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Clock, TrendingUp, AlertCircle, Bell, Activity } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/enquiries/StatusBadge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const [totalClients, activeEnquiries, kycPending, dealsThisMonth, overdueReminders, todayReminders, recentActivity] =
    await Promise.all([
      prisma.client.count(),
      prisma.enquiry.count({ where: { status: { notIn: ["COMPLETED", "DROPPED"] } } }),
      prisma.enquiry.count({ where: { status: "KYC_PENDING" } }),
      prisma.enquiry.count({
        where: { status: { in: ["DEAL_CLOSED", "COMPLETED"] }, updatedAt: { gte: startOfMonth } },
      }),
      prisma.reminder.findMany({
        where: { isCompleted: false, dueDate: { lt: now } },
        include: { enquiry: { include: { client: true, service: true } } },
        orderBy: { dueDate: "asc" },
        take: 8,
      }),
      prisma.reminder.findMany({
        where: { isCompleted: false, dueDate: { gte: now, lte: todayEnd } },
        include: { enquiry: { include: { client: true, service: true } } },
        orderBy: { dueDate: "asc" },
      }),
      prisma.statusHistory.findMany({
        include: { enquiry: { include: { client: true, service: true } } },
        orderBy: { changedAt: "desc" },
        take: 10,
      }),
    ]);

  return { totalClients, activeEnquiries, kycPending, dealsThisMonth, overdueReminders, todayReminders, recentActivity };
}

export default async function DashboardPage() {
  const { totalClients, activeEnquiries, kycPending, dealsThisMonth, overdueReminders, todayReminders, recentActivity } =
    await getDashboardData();

  const stats = [
    { label: "Total Clients", value: totalClients, icon: Users, color: "text-blue-400", bg: "bg-blue-900/40" },
    { label: "Active Enquiries", value: activeEnquiries, icon: FileText, color: "text-orange-400", bg: "bg-orange-900/40" },
    { label: "KYC Pending", value: kycPending, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-900/40" },
    { label: "Deals (This Month)", value: dealsThisMonth, icon: TrendingUp, color: "text-green-400", bg: "bg-green-900/40" },
  ];

  return (
    <>
      <Header title="Dashboard" subtitle="Overview of your financial applications" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{s.label}</p>
                      <p className="text-3xl font-bold mt-1">{s.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${s.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overdue Reminders */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  Overdue Reminders
                  {overdueReminders.length > 0 && (
                    <span className="bg-red-900/40 text-red-300 text-xs px-2 py-0.5 rounded-full">
                      {overdueReminders.length}
                    </span>
                  )}
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/reminders">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {overdueReminders.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No overdue reminders</p>
              ) : (
                <div className="space-y-2">
                  {overdueReminders.map((r) => (
                    <Link
                      key={r.id}
                      href={`/enquiries/${r.enquiryId}`}
                      className="flex items-start gap-3 p-3 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition-colors"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-100 truncate">{r.enquiry.client.name}</p>
                        <p className="text-xs text-slate-500">{r.enquiry.service.name} · {r.message}</p>
                        <p className="text-xs text-red-600 mt-0.5">Due: {formatDate(r.dueDate)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Reminders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                {"Today's Reminders"}
                {todayReminders.length > 0 && (
                  <span className="bg-blue-900/40 text-blue-300 text-xs px-2 py-0.5 rounded-full">
                    {todayReminders.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayReminders.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No reminders for today</p>
              ) : (
                <div className="space-y-2">
                  {todayReminders.map((r) => (
                    <Link
                      key={r.id}
                      href={`/enquiries/${r.enquiryId}`}
                      className="flex items-start gap-3 p-3 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 transition-colors"
                    >
                      <Bell className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-100 truncate">{r.enquiry.client.name}</p>
                        <p className="text-xs text-slate-500">{r.enquiry.service.name} · {r.message}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((h) => (
                  <Link
                    key={h.id}
                    href={`/enquiries/${h.enquiryId}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-100">
                        {h.enquiry.client.name}
                        <span className="text-slate-400 font-normal"> · {h.enquiry.service.name}</span>
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {h.fromStatus && (
                          <span className="text-xs text-slate-400">{h.fromStatus.replace(/_/g, " ")} →</span>
                        )}
                        <StatusBadge status={h.toStatus} className="text-xs py-0" />
                        {h.notes && <span className="text-xs text-slate-400 ml-1">· {h.notes}</span>}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{formatDateTime(h.changedAt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
