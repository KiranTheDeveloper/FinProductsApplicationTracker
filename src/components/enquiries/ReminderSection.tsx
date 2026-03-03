"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, isOverdue, isDueToday } from "@/lib/utils";
import { Check, Plus, Bell, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reminder {
  id: string;
  dueDate: Date | string;
  message: string;
  isCompleted: boolean;
}

interface ReminderSectionProps {
  enquiryId: string;
  initialReminders: Reminder[];
}

export function ReminderSection({ enquiryId, initialReminders }: ReminderSectionProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [showAdd, setShowAdd] = useState(false);
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const addReminder = async () => {
    if (!date || !message) return;
    setSaving(true);
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enquiryId, dueDate: date, message }),
    });
    if (res.ok) {
      const r = await res.json();
      setReminders((prev) => [...prev, r]);
      setDate("");
      setMessage("");
      setShowAdd(false);
    }
    setSaving(false);
  };

  const complete = async (id: string) => {
    await fetch(`/api/reminders/${id}`, { method: "PUT" });
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, isCompleted: true } : r));
  };

  const active = reminders.filter((r) => !r.isCompleted);
  const done = reminders.filter((r) => r.isCompleted);

  return (
    <div className="space-y-3">
      {/* Active reminders */}
      {active.length === 0 ? (
        <p className="text-xs text-slate-400">No active reminders</p>
      ) : (
        <div className="space-y-2">
          {active.map((r) => {
            const over = isOverdue(r.dueDate);
            const today = isDueToday(r.dueDate);
            return (
              <div
                key={r.id}
                className={cn(
                  "flex items-start gap-2 p-2.5 rounded-lg",
                  over ? "bg-red-900/30" : today ? "bg-amber-900/30" : "bg-slate-700/50"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {over ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Bell className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200">{r.message}</p>
                  <p className={cn("text-xs mt-0.5", over ? "text-red-600" : "text-slate-400")}>
                    {formatDate(r.dueDate)}
                    {over && " — Overdue!"}
                    {today && !over && " — Today"}
                  </p>
                </div>
                <button
                  onClick={() => complete(r.id)}
                  className="text-slate-400 hover:text-green-600 p-1 flex-shrink-0"
                  title="Mark complete"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <p className="text-xs text-slate-400">{done.length} completed reminder{done.length > 1 ? "s" : ""}</p>
      )}

      {/* Add form */}
      {showAdd ? (
        <div className="space-y-2 border border-slate-600 rounded-lg p-3">
          <div className="space-y-1">
            <Label className="text-xs">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Message</Label>
            <Input placeholder="e.g. Call client for KYC" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={addReminder} disabled={saving || !date || !message}>
              {saving ? "..." : "Add"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAdd(true)}>
          <Plus className="w-3 h-3" />
          Add Reminder
        </Button>
      )}
    </div>
  );
}
