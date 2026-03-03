export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Bell, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { formatDate, isOverdue, isDueToday } from "@/lib/utils";
import { StatusBadge } from "@/components/enquiries/StatusBadge";
import { ReminderCompleteButton } from "@/components/RemindersCompleteButton";

async function getReminders() {
  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const allReminders = await prisma.reminder.findMany({
    include: {
      enquiry: { include: { client: true, service: true, product: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const overdue = allReminders.filter((r) => !r.isCompleted && new Date(r.dueDate) < now);
  const today = allReminders.filter((r) => !r.isCompleted && new Date(r.dueDate) >= now && new Date(r.dueDate) <= todayEnd);
  const upcoming = allReminders.filter((r) => !r.isCompleted && new Date(r.dueDate) > todayEnd);
  const completed = allReminders.filter((r) => r.isCompleted).slice(0, 20);

  return { overdue, today, upcoming, completed };
}

function ReminderRow({ r, highlight }: { r: Awaited<ReturnType<typeof getReminders>>["overdue"][0]; highlight?: "red" | "amber" }) {
  return (
    <div className={`flex items-start gap-3 p-3 sm:p-4 rounded-lg ${highlight === "red" ? "bg-red-900/30" : highlight === "amber" ? "bg-amber-900/30" : "bg-slate-700/50"}`}>
      <div className="flex-shrink-0">
        {highlight === "red" ? (
          <AlertCircle className="w-5 h-5 text-red-500" />
        ) : highlight === "amber" ? (
          <Bell className="w-5 h-5 text-amber-500" />
        ) : (
          <Clock className="w-5 h-5 text-slate-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/clients/${r.enquiry.clientId}`} className="font-semibold text-slate-100 hover:underline">
            {r.enquiry.client.name}
          </Link>
          <span className="text-xs text-slate-400">{r.enquiry.client.mobile}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">{r.enquiry.service.name}</span>
          {r.enquiry.product && <span className="text-xs text-slate-400">· {r.enquiry.product.name}</span>}
          <StatusBadge status={r.enquiry.status} className="text-xs" />
        </div>
        <p className="text-sm text-slate-300 mt-1">{r.message}</p>
        <p className={`text-xs mt-0.5 ${highlight === "red" ? "text-red-600 font-medium" : "text-slate-500"}`}>
          {formatDate(r.dueDate)}
          {highlight === "red" && " — Overdue"}
          {highlight === "amber" && " — Today"}
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Link href={`/enquiries/${r.enquiryId}`} className="text-xs text-blue-600 hover:underline">
          View
        </Link>
        {!r.isCompleted && (
          <ReminderCompleteButton reminderId={r.id} />
        )}
      </div>
    </div>
  );
}

export default async function RemindersPage() {
  const { overdue, today, upcoming, completed } = await getReminders();

  return (
    <>
      <Header title="Reminders" subtitle="Follow-up actions and deadlines" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Overdue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              Overdue ({overdue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdue.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">No overdue reminders</p>
            ) : (
              <div className="space-y-2">
                {overdue.map((r) => <ReminderRow key={r.id} r={r} highlight="red" />)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <Bell className="w-4 h-4" />
              {"Today's Reminders"} ({today.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {today.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">Nothing due today</p>
            ) : (
              <div className="space-y-2">
                {today.map((r) => <ReminderRow key={r.id} r={r} highlight="amber" />)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Upcoming ({upcoming.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">No upcoming reminders</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((r) => <ReminderRow key={r.id} r={r} />)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed */}
        {completed.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                Completed (recent)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 opacity-60">
                {completed.map((r) => (
                  <div key={r.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/50">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-through text-slate-400">{r.enquiry.client.name}</p>
                      <p className="text-xs text-slate-400">{r.message}</p>
                    </div>
                    <p className="text-xs text-slate-400">{formatDate(r.dueDate)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
