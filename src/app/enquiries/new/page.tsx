import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { EnquiryForm } from "@/components/enquiries/EnquiryForm";

async function getData(clientId?: string) {
  const [services, clients] = await Promise.all([
    prisma.service.findMany({ include: { products: true }, orderBy: { name: "asc" } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
  ]);
  const preselectedClient = clientId
    ? clients.find((c) => c.id === clientId)
    : null;
  return { services, clients, preselectedClient };
}

export default async function NewEnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const { services, clients, preselectedClient } = await getData(clientId);

  return (
    <>
      <Header title="New Enquiry" subtitle="Record a new service enquiry" />
      <div className="p-6 max-w-2xl">
        <EnquiryForm
          services={services}
          clients={clients}
          preselectedClientId={preselectedClient?.id}
        />
      </div>
    </>
  );
}
