export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/enquiries/StatusBadge";
import { SERVICE_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Phone, Mail, Calendar, Plus, FileText, Bell } from "lucide-react";
import { KYCUploader } from "@/components/clients/KYCUploader";

async function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      enquiries: {
        include: {
          service: true,
          product: true,
          reminders: { where: { isCompleted: false }, orderBy: { dueDate: "asc" }, take: 1 },
        },
        orderBy: { updatedAt: "desc" },
      },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  return (
    <>
      <Header title={client.name} subtitle={`${client.type === "EXISTING_CLIENT" ? "Existing Client" : "Prospect"} · Added ${formatDate(client.createdAt)}`} />
      <div className="p-6 space-y-6">
        {/* Client Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-900/40 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-300">{client.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{client.name}</h2>
                    <Badge className={client.type === "EXISTING_CLIENT" ? "bg-green-900/40 text-green-300" : "bg-slate-700 text-slate-300"}>
                      {client.type === "EXISTING_CLIENT" ? "Existing Client" : "Prospect"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                      {client.mobile}
                    </span>
                    {client.email && (
                      <span className="flex items-center gap-1.5 text-sm text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                        {client.email}
                      </span>
                    )}
                    {client.dob && (
                      <span className="flex items-center gap-1.5 text-sm text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        DOB: {formatDate(client.dob)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/enquiries/new?clientId=${id}`}>
                    <Plus className="w-4 h-4" />
                    New Enquiry
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enquiries */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Enquiries ({client.enquiries.length})
              </h3>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/enquiries/new?clientId=${id}`}>
                  <Plus className="w-3 h-3" />
                  Add
                </Link>
              </Button>
            </div>

            {client.enquiries.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-slate-400">No enquiries yet.</p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href={`/enquiries/new?clientId=${id}`}>
                      <Plus className="w-3 h-3" />
                      Create First Enquiry
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {client.enquiries.map((enq) => (
                  <Link key={enq.id} href={`/enquiries/${enq.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SERVICE_COLORS[enq.service.code] || ""}`}>
                                {enq.service.code}
                              </span>
                              <span className="font-medium text-sm">{enq.service.name}</span>
                              {enq.product && (
                                <span className="text-sm text-slate-500">· {enq.product.name}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={enq.status} />
                              {enq.reminders[0] && (
                                <span className="flex items-center gap-1 text-xs text-amber-600">
                                  <Bell className="w-3 h-3" />
                                  Due: {formatDate(enq.reminders[0].dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-400">{formatDate(enq.updatedAt)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* KYC Documents */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-100">KYC Documents</h3>
            <KYCUploader clientId={id} initialDocuments={client.documents} />
          </div>
        </div>
      </div>
    </>
  );
}
