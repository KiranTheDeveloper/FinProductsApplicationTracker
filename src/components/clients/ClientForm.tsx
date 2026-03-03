"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  mobile: z.string().min(10, "Enter valid 10-digit mobile number").max(15),
  email: z.string().email("Enter valid email").optional().or(z.literal("")),
  dob: z.string().optional(),
  type: z.enum(["PROSPECT", "EXISTING_CLIENT"]),
});

type FormData = z.infer<typeof schema>;

interface ClientFormProps {
  defaultValues?: Partial<FormData> & { id?: string };
  onSuccess?: (client: { id: string }) => void;
}

export function ClientForm({ defaultValues, onSuccess }: ClientFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const isEdit = !!defaultValues?.id;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name || "",
      mobile: defaultValues?.mobile || "",
      email: defaultValues?.email || "",
      dob: defaultValues?.dob || "",
      type: defaultValues?.type || "PROSPECT",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    const url = isEdit ? `/api/clients/${defaultValues!.id}` : "/api/clients";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Failed to save client");
      return;
    }

    const client = await res.json();
    setSubmitted(true);
    if (onSuccess) {
      onSuccess(client);
    } else {
      router.push(`/clients/${client.id}`);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" placeholder="e.g. Rajesh Kumar" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input id="mobile" placeholder="e.g. 9876543210" {...register("mobile")} />
            {errors.mobile && <p className="text-sm text-red-500">{errors.mobile.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="e.g. rajesh@email.com" {...register("email")} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" {...register("dob")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Client Type</Label>
            <select
              id="type"
              {...register("type")}
              className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PROSPECT">Prospect</option>
              <option value="EXISTING_CLIENT">Existing Client</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting || submitted}>
              {isSubmitting || submitted ? "Saving..." : isEdit ? "Update Client" : "Add Client"}
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
