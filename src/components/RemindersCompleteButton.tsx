"use client";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useState } from "react";

export function ReminderCompleteButton({ reminderId }: { reminderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    await fetch(`/api/reminders/${reminderId}`, { method: "PUT" });
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-medium disabled:opacity-50"
    >
      <Check className="w-3 h-3" />
      {loading ? "..." : "Done"}
    </button>
  );
}
