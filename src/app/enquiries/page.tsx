export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/enquiries/StatusBadge";
import { formatDate } from "@/lib/utils";
import { SERVICE_COLORS, ENQUIRY_STATUS_LABELS } from "@/lib/constants";
import { Bell, Plus } from "lucide-react";
import { EnquiriesFilter } from "@/components/enquiries/EnquiriesFilter";
import type { EnquiryStatus } from "@/generated/prisma/client";

async function getEnquiries(service: string, status: string) {
  return prisma.enquiry.findMany({
    where: {
      ...(service ? { service: { code: service } } : {}),
      ...(status ? { status: status as EnquiryStatus } : {}),
    },
    include: {
      client: true,
      service: true,
      product: true,
      reminders: { where: { isCompleted: false }, orderBy: { dueDate: "asc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; status?: string }>;
}) {
  const { service = "", status = "" } = await searchParams;
  const enquiries = await getEnquiries(service, status);

  const services = ["LIFE", "HEALTH", "MF", "ITR"];
  const serviceNames: Record<string, string> = {
    LIFE: "Life Insurance",
    HEALTH: "Health Insurance",
    MF: "Mutual Funds",
    ITR: "IT Returns",
  };

  return (
    <>
      <Header title="Enquiries" subtitle={`${enquiries.length} enquiries`} />
      <div className="p-6 space-y-4">
        {/* Service Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-700">
          <Link
            href="/enquiries"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${!service ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}
          >
            All
          </Link>
          {services.map((code) => (
            <Link
              key={code}
              href={`/enquiries?service=${code}${status ? `&status=${status}` : ""}`}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${service === code ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}
            >
              {serviceNames[code]}
            </Link>
          ))}
        </div>

        {/* Status filter + New button */}
        <div className="flex items-center gap-3">
          <EnquiriesFilter initialService={service} initialStatus={status} />
          <Button asChild size="sm">
            <Link href="/enquiries/new">
              <Plus className="w-4 h-4" />
              New Enquiry
            </Link>
          </Button>
        </div>

        {/* List */}
        {enquiries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">No enquiries found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {enquiries.map((enq) => (
              <Link key={enq.id} href={`/enquiries/${enq.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Service badge */}
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${SERVICE_COLORS[enq.service.code] || ""}`}>
                        {enq.service.code}
                      </span>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-100">{enq.client.name}</p>
                          <span className="text-xs text-slate-400">{enq.client.mobile}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {enq.service.name}{enq.product ? ` · ${enq.product.name}` : ""}
                        </p>
                      </div>
                      {/* Status */}
                      <StatusBadge status={enq.status} />
                      {/* Reminder */}
                      {enq.reminders[0] && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 flex-shrink-0">
                          <Bell className="w-3 h-3" />
                          {formatDate(enq.reminders[0].dueDate)}
                        </span>
                      )}
                      {/* Date */}
                      <p className="text-xs text-slate-400 flex-shrink-0">{formatDate(enq.updatedAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
