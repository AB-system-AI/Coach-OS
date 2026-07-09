"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitContactForm } from "@/features/website/actions/public-booking-actions";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

type ContactFormProps = {
  tenantId: string;
  primaryColor?: string;
};

export function ContactForm({ tenantId, primaryColor }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await submitContactForm({ ...values, tenantId });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle
          className="h-12 w-12"
          style={{ color: primaryColor ?? "var(--tenant-primary)" }}
        />
        <h3 className="text-xl font-semibold">Message Sent!</h3>
        <p className="text-muted-foreground">
          We&apos;ll get back to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            {...register("name")}
            placeholder="Your name"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-[var(--tenant-primary)]"
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Email <span className="text-destructive">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="your@email.com"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-[var(--tenant-primary)]"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Phone</label>
          <input
            {...register("phone")}
            placeholder="+1 (555) 000-0000"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-[var(--tenant-primary)]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Subject <span className="text-destructive">*</span>
          </label>
          <input
            {...register("subject")}
            placeholder="How can we help?"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-[var(--tenant-primary)]"
          />
          {errors.subject && (
            <p className="text-xs text-destructive">{errors.subject.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">
          Message <span className="text-destructive">*</span>
        </label>
        <textarea
          {...register("message")}
          rows={5}
          placeholder="Tell us more about your goals..."
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-[var(--tenant-primary)] resize-none"
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        style={{ backgroundColor: primaryColor ?? "var(--tenant-primary)", color: "#fff" }}
      >
        {isSubmitting ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
