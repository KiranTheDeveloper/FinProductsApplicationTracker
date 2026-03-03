"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABELS } from "@/lib/constants";
import { ArrowRight } from "lucide-react";

interface StatusUpdateModalProps {
  enquiryId: string;
  currentStatus: string;
  serviceCode: string;
}

export function StatusUpdateModal({ enquiryId, currentStatus, serviceCode }: StatusUpdateModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");
  const [addReminder, setAddReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (newStatus === currentStatus && !notes) {
      setError("Please change the status or add notes");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch(`/api/enquiries/${enquiryId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        notes: notes || undefined,
        reminderDate: addReminder && reminderDate ? reminderDate : undefined,
        reminderMessage: addReminder && reminderMessage ? reminderMessage : undefined,
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Failed to update");
      setSaving(false);
      return;
    }

    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ArrowRight className="w-4 h-4" />
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Enquiry Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* New Status */}
          <div className="space-y-2">
            <Label>New Status</Label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ENQUIRY_STATUSES.map((s) => (
                <option key={s} value={s}>{ENQUIRY_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="What happened? Any important details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Reminder */}
          <div className="rounded-lg border border-amber-700 bg-amber-900/30 p-3 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-amber-300">
              <input
                type="checkbox"
                checked={addReminder}
                onChange={(e) => setAddReminder(e.target.checked)}
                className="rounded"
              />
              Set a follow-up reminder
            </label>
            {addReminder && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Message</Label>
                  <Input
                    placeholder="e.g. Follow up on KYC"
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
