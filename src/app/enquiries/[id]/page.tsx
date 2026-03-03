export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/enquiries/StatusBadge";
import { SERVICE_COLORS, ENQUIRY_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { User, Phone, Bell, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { StatusUpdateModal } from "@/components/enquiries/StatusUpdateModal";
import { ReminderSection } from "@/components/enquiries/ReminderSection";
import { Button } from "@/components/ui/button";

async function getEnquiry(id: string) {
  return prisma.enquiry.findUnique({
    where: { id },
    include: {
      client: true,
      service: true,
      product: true,
      statusHistory: { orderBy: { changedAt: "desc" } },
      reminders: { orderBy: { dueDate: "asc" } },
      documents: true,
    },
  });
}

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enquiry = await getEnquiry(id);
  if (!enquiry) notFound();

  return (
    <>
      <Header title={`${enquiry.client.name} — ${enquiry.service.name}`} subtitle={`Enquiry · ${formatDate(enquiry.createdAt)}`} />
      <div className="p-6 space-y-6">
        {/* Top: Status + Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-sm px-3 py-1 rounded-full border font-medium ${SERVICE_COLORS[enquiry.service.code] || ""}`}>
              {enquiry.service.name}
            </span>
            {enquiry.product && (
              <span className="text-sm text-slate-400">· {enquiry.product.name}</span>
            )}
            <StatusBadge status={enquiry.status} className="text-sm" />
          </div>
          <StatusUpdateModal
            enquiryId={enquiry.id}
            currentStatus={enquiry.status}
            serviceCode={enquiry.service.code}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Client Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">{enquiry.client.name}</p>
                    <p className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Phone className="w-3.5 h-3.5" />
                      {enquiry.client.mobile}
                    </p>
                    {enquiry.client.email && (
                      <p className="text-sm text-slate-500">{enquiry.client.email}</p>
                    )}
                    {enquiry.client.dob && (
                      <p className="text-sm text-slate-500">DOB: {formatDate(enquiry.client.dob)}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/clients/${enquiry.clientId}`}>View Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Financial Details */}
            {(enquiry.premium || enquiry.sumAssured || enquiry.investmentAmount) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Financial Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {enquiry.premium && (
                      <div>
                        <p className="text-xs text-slate-400">Premium</p>
                        <p className="font-semibold">₹{enquiry.premium.toLocaleString("en-IN")}</p>
                      </div>
                    )}
                    {enquiry.sumAssured && (
                      <div>
                        <p className="text-xs text-slate-400">Sum Assured</p>
                        <p className="font-semibold">₹{enquiry.sumAssured.toLocaleString("en-IN")}</p>
                      </div>
                    )}
                    {enquiry.investmentAmount && (
                      <div>
                        <p className="text-xs text-slate-400">Investment</p>
                        <p className="font-semibold">₹{enquiry.investmentAmount.toLocaleString("en-IN")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {enquiry.notes && (
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-slate-400 mb-1">Notes</p>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{enquiry.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Status Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {enquiry.statusHistory.length === 0 ? (
                  <p className="text-sm text-slate-400">No status history yet.</p>
                ) : (
                  <div className="space-y-4">
                    {enquiry.statusHistory.map((h, i) => (
                      <div key={h.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${i === 0 ? "bg-blue-500" : "bg-slate-600"}`} />
                          {i < enquiry.statusHistory.length - 1 && (
                            <div className="w-px flex-1 bg-slate-700 mt-1" />
                          )}
                        </div>
                        <div className="pb-4 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {h.fromStatus && (
                              <>
                                <StatusBadge status={h.fromStatus} className="text-xs" />
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                              </>
                            )}
                            <StatusBadge status={h.toStatus} className="text-xs" />
                          </div>
                          {h.notes && <p className="text-xs text-slate-500 mt-1">{h.notes}</p>}
                          <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(h.changedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Reminders */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReminderSection
                  enquiryId={enquiry.id}
                  initialReminders={enquiry.reminders}
                />
              </CardContent>
            </Card>

            {/* KYC Documents link */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  KYC Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {enquiry.documents.length === 0 ? (
                  <div className="text-center space-y-2">
                    <p className="text-xs text-slate-400">No documents linked</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/clients/${enquiry.clientId}`}>
                        Upload on Client Profile
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {enquiry.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-slate-400">{doc.documentType}</span>
                        <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline ml-auto">
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
