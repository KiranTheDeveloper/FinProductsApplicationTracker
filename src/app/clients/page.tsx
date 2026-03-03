export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Phone, Mail, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { SERVICE_COLORS } from "@/lib/constants";
import { ClientsSearchFilter } from "@/components/clients/ClientsSearchFilter";

async function getClients(search: string, type: string) {
  return prisma.client.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { name: { contains: search } },
            { mobile: { contains: search } },
          ],
        } : {},
        type ? { type: type as "PROSPECT" | "EXISTING_CLIENT" } : {},
      ],
    },
    include: {
      enquiries: { include: { service: true } },
      _count: { select: { enquiries: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string }>;
}) {
  const { search = "", type = "" } = await searchParams;
  const clients = await getClients(search, type);

  return (
    <>
      <Header title="Clients" subtitle={`${clients.length} clients`} />
      <div className="p-6 space-y-4">
        {/* Search + Filter + Add */}
        <div className="flex items-center gap-3">
          <ClientsSearchFilter initialSearch={search} initialType={type} />
          <Button asChild>
            <Link href="/clients/new">
              <UserPlus className="w-4 h-4" />
              Add Client
            </Link>
          </Button>
        </div>

        {/* Client List */}
        {clients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">No clients found. Add your first client!</p>
              <Button asChild className="mt-4">
                <Link href="/clients/new">
                  <UserPlus className="w-4 h-4" />
                  Add Client
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {clients.map((client) => {
              const services = [...new Set(client.enquiries.map((e) => e.service.code))];
              return (
                <Link key={client.id} href={`/clients/${client.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-slate-300">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-100">{client.name}</p>
                            <Badge className={client.type === "EXISTING_CLIENT" ? "bg-green-900/40 text-green-300" : "bg-slate-700 text-slate-300"}>
                              {client.type === "EXISTING_CLIENT" ? "Client" : "Prospect"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Phone className="w-3 h-3" />
                              {client.mobile}
                            </span>
                            {client.email && (
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Mail className="w-3 h-3" />
                                {client.email}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Services */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {services.map((code) => (
                            <span
                              key={code}
                              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SERVICE_COLORS[code] || "bg-gray-800 text-gray-300 border-gray-600"}`}
                            >
                              {code}
                            </span>
                          ))}
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <FileText className="w-3 h-3" />
                            {client._count.enquiries} enquiries
                          </span>
                        </div>
                        {/* Date */}
                        <p className="text-xs text-slate-400 flex-shrink-0">{formatDate(client.createdAt)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
