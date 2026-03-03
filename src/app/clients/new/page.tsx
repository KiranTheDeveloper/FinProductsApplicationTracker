import { Header } from "@/components/layout/Header";
import { ClientForm } from "@/components/clients/ClientForm";

export default function NewClientPage() {
  return (
    <>
      <Header title="Add Client" subtitle="Create a new client or prospect record" />
      <div className="p-6 max-w-xl">
        <ClientForm />
      </div>
    </>
  );
}
