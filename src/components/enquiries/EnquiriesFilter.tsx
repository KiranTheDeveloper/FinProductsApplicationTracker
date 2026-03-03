"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ENQUIRY_STATUS_LABELS, ENQUIRY_STATUSES } from "@/lib/constants";

export function EnquiriesFilter({
  initialService,
  initialStatus,
}: {
  initialService: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const params = new URLSearchParams();
    if (initialService) params.set("service", initialService);
    if (status) params.set("status", status);
    startTransition(() => {
      router.push(`/enquiries?${params.toString()}`);
    });
  }, [status, initialService, router]);

  return (
    <select
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      className="h-10 rounded-md border border-slate-600 bg-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">All Statuses</option>
      {ENQUIRY_STATUSES.map((s) => (
        <option key={s} value={s}>{ENQUIRY_STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}
