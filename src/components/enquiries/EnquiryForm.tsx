"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface Service {
  id: string;
  name: string;
  code: string;
  products: { id: string; name: string }[];
}

interface Client {
  id: string;
  name: string;
  mobile: string;
}

const schema = z.object({
  clientId: z.string().min(1, "Select a client"),
  serviceId: z.string().min(1, "Select a service"),
  productId: z.string().optional(),
  notes: z.string().optional(),
  premium: z.string().optional(),
  sumAssured: z.string().optional(),
  investmentAmount: z.string().optional(),
  reminderDate: z.string().optional(),
  reminderMessage: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface EnquiryFormProps {
  services: Service[];
  clients: Client[];
  preselectedClientId?: string;
}

export function EnquiryForm({ services, clients, preselectedClientId }: EnquiryFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [showReminder, setShowReminder] = useState(true);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientId: preselectedClientId || "",
      serviceId: "",
      productId: "",
    },
  });

  const watchedServiceId = watch("serviceId");
  const selectedService = services.find((s) => s.id === watchedServiceId);

  const onSubmit = async (data: FormData) => {
    setError("");
    const payload = {
      clientId: data.clientId,
      serviceId: data.serviceId,
      productId: data.productId || undefined,
      notes: data.notes || undefined,
      premium: data.premium ? parseFloat(data.premium) : undefined,
      sumAssured: data.sumAssured ? parseFloat(data.sumAssured) : undefined,
      investmentAmount: data.investmentAmount ? parseFloat(data.investmentAmount) : undefined,
      reminderDate: data.reminderDate || undefined,
      reminderMessage: data.reminderMessage || undefined,
    };

    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Failed to create enquiry");
      return;
    }

    const enquiry = await res.json();
    setSubmitted(true);
    router.push(`/enquiries/${enquiry.id}`);
  };

  const isLifeOrHealth = selectedService?.code === "LIFE" || selectedService?.code === "HEALTH";
  const isMF = selectedService?.code === "MF";

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Client */}
          <div className="space-y-2">
            <Label>Client *</Label>
            <select
              {...register("clientId")}
              className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Select Client —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
              ))}
            </select>
            {errors.clientId && <p className="text-sm text-red-500">{errors.clientId.message}</p>}
          </div>

          {/* Service */}
          <div className="space-y-2">
            <Label>Service *</Label>
            <select
              {...register("serviceId")}
              onChange={(e) => {
                setValue("serviceId", e.target.value);
                setValue("productId", "");
              }}
              className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Select Service —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.serviceId && <p className="text-sm text-red-500">{errors.serviceId.message}</p>}
          </div>

          {/* Product (filtered by service) */}
          {selectedService && selectedService.products.length > 0 && (
            <div className="space-y-2">
              <Label>Product / Provider</Label>
              <select
                {...register("productId")}
                className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select later —</option>
                {selectedService.products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Financial fields */}
          {isLifeOrHealth && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expected Premium (₹)</Label>
                <Input type="number" placeholder="0" {...register("premium")} />
              </div>
              <div className="space-y-2">
                <Label>Sum Assured (₹)</Label>
                <Input type="number" placeholder="0" {...register("sumAssured")} />
              </div>
            </div>
          )}
          {isMF && (
            <div className="space-y-2">
              <Label>Investment Amount (₹)</Label>
              <Input type="number" placeholder="0" {...register("investmentAmount")} />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Any additional notes..." {...register("notes")} />
          </div>

          {/* Reminder */}
          <div className="border rounded-lg p-4 space-y-3 bg-amber-900/30 border-amber-700">
            <label className="flex items-center gap-2 text-sm font-medium text-amber-300">
              <input
                type="checkbox"
                checked={showReminder}
                onChange={(e) => setShowReminder(e.target.checked)}
                className="rounded"
              />
              Set a follow-up reminder
            </label>
            {showReminder && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Reminder Date</Label>
                  <Input type="date" {...register("reminderDate")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Message</Label>
                  <Input placeholder="e.g. Send proposal" {...register("reminderMessage")} />
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting || submitted}>
              {isSubmitting || submitted ? "Creating..." : "Create Enquiry"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
