export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/enquiries/StatusBadge";
import { formatDate } from "@/lib/utils";
import { SERVICE_COLORS } from "@/lib/constants";
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
    LIFE: "Life",
    HEALTH: "Health",
    MF: "MF",
    ITR: "ITR",
  };

  return (
    <>
      <Header title="Enquiries" subtitle={`${enquiries.length} enquiries`} />
      <div className="p-4 sm:p-6 space-y-4">
        {/* Service Tabs — horizontally scrollable on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-1 border-b border-slate-700 min-w-max">
            <Link
              href="/enquiries"
              className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${!service ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}
            >
              All
            </Link>
            {services.map((code) => (
              <Link
                key={code}
                href={`/enquiries?service=${code}${status ? `&status=${status}` : ""}`}
                className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${service === code ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}
              >
                {serviceNames[code]}
              </Link>
            ))}
          </div>
        </div>

        {/* Status filter + New button */}
        <div className="flex items-center gap-2">
          <EnquiriesFilter initialService={service} initialStatus={status} />
          <Button asChild size="sm" className="flex-shrink-0">
            <Link href="/enquiries/new">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Enquiry</span>
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
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      {/* Service badge */}
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium flex-shrink-0 mt-0.5 ${SERVICE_COLORS[enq.service.code] || ""}`}>
                        {enq.service.code}
                      </span>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-100 truncate">{enq.client.name}</p>
                          <StatusBadge status={enq.status} />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {enq.service.name}{enq.product ? ` · ${enq.product.name}` : ""}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-500">{enq.client.mobile}</span>
                          {enq.reminders[0] && (
                            <span className="flex items-center gap-1 text-xs text-amber-500">
                              <Bell className="w-3 h-3" />
                              {formatDate(enq.reminders[0].dueDate)}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 ml-auto">{formatDate(enq.updatedAt)}</span>
                        </div>
                      </div>
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
