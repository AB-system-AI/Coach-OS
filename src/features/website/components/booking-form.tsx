"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitBookingRequest } from "@/features/website/actions/public-booking-actions";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import type { RecoveryService, TimeSlot } from "@prisma/client";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  serviceId: z.string().min(1, "Select a service"),
  preferredDate: z.string().min(1, "Select a date"),
  preferredTime: z.string().min(1, "Select a time"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type ServiceWithSlots = RecoveryService & { timeSlots: TimeSlot[] };

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type BookingFormProps = {
  tenantId: string;
  services: ServiceWithSlots[];
  primaryColor?: string;
};

export function BookingForm({ tenantId, services, primaryColor }: BookingFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedServiceId = watch("serviceId");
  const selectedDate = watch("preferredDate");

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
  const selectedDayOfWeek = selectedDateObj
    ? DAY_NAMES[selectedDateObj.getDay()].toUpperCase()
    : null;

  const availableSlots = selectedService?.timeSlots.filter(
    (slot) => !selectedDayOfWeek || slot.dayOfWeek === selectedDayOfWeek
  ) ?? [];

  async function onSubmit(values: FormValues) {
    setError(null);
    const service = services.find((s) => s.id === values.serviceId);
    try {
      await submitBookingRequest({
        ...values,
        tenantId,
        serviceName: service?.name ?? values.serviceId,
      });
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
        <h3 className="text-xl font-semibold">Booking Request Sent!</h3>
        <p className="text-muted-foreground max-w-sm">
          We&apos;ve received your request and will confirm your appointment shortly.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-[var(--tenant-primary)]";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Name *</label>
          <input {...register("name")} placeholder="Your name" className={inputCls} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email *</label>
          <input {...register("email")} type="email" placeholder="your@email.com" className={inputCls} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Phone</label>
          <input {...register("phone")} placeholder="+1 (555) 000-0000" className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Service *</label>
          <select {...register("serviceId")} className={inputCls}>
            <option value="">Select a service…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.duration} min · {s.currency} {Number(s.price).toFixed(2)}
              </option>
            ))}
          </select>
          {errors.serviceId && (
            <p className="text-xs text-destructive">{errors.serviceId.message}</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Preferred Date *</label>
          <input
            {...register("preferredDate")}
            type="date"
            min={new Date().toISOString().split("T")[0]}
            className={inputCls}
          />
          {errors.preferredDate && (
            <p className="text-xs text-destructive">{errors.preferredDate.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Preferred Time *</label>
          {availableSlots.length > 0 ? (
            <select {...register("preferredTime")} className={inputCls}>
              <option value="">Select a time slot…</option>
              {availableSlots.map((slot) => (
                <option key={slot.id} value={slot.startTime}>
                  {slot.startTime} – {slot.endTime}
                </option>
              ))}
            </select>
          ) : (
            <input
              {...register("preferredTime")}
              type="time"
              className={inputCls}
            />
          )}
          {errors.preferredTime && (
            <p className="text-xs text-destructive">{errors.preferredTime.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Additional Notes</label>
        <textarea
          {...register("notes")}
          rows={3}
          placeholder="Any special requests or health information..."
          className={`${inputCls} resize-none`}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        style={{ backgroundColor: primaryColor ?? "var(--tenant-primary)", color: "#fff" }}
      >
        {isSubmitting ? "Sending Request…" : "Request Appointment"}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        We&apos;ll confirm your booking via email within 24 hours.
      </p>
    </form>
  );
}
