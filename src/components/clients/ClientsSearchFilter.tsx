"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useTransition, useState, useEffect } from "react";

export function ClientsSearchFilter({
  initialSearch,
  initialType,
}: {
  initialSearch: string;
  initialType: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState(initialType);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    startTransition(() => {
      router.push(`/clients?${params.toString()}`);
    });
  }, [search, type, router]);

  return (
    <div className="flex items-center gap-2 flex-1">
      <Input
        placeholder="Search by name or mobile..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="h-10 rounded-md border border-slate-600 bg-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Types</option>
        <option value="PROSPECT">Prospects</option>
        <option value="EXISTING_CLIENT">Existing Clients</option>
      </select>
    </div>
  );
}
