"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

// ── Booking Request (public → CrmLead) ───────────────────────────────────────

const bookingSchema = z.object({
  tenantId: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  serviceId: z.string(),
  serviceName: z.string(),
  preferredDate: z.string(),
  preferredTime: z.string(),
  notes: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export async function submitBookingRequest(raw: BookingFormData) {
  const data = bookingSchema.parse(raw);

  await db.crmLead.create({
    data: {
      tenantId: data.tenantId,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      source: "website_booking",
      status: "NEW",
      notes: [
        `Service: ${data.serviceName}`,
        `Preferred Date: ${data.preferredDate}`,
        `Preferred Time: ${data.preferredTime}`,
        data.notes ? `Notes: ${data.notes}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  });

  return { success: true };
}

// ── Contact Form (public → CrmLead) ──────────────────────────────────────────

const contactSchema = z.object({
  tenantId: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(10),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export async function submitContactForm(raw: ContactFormData) {
  const data = contactSchema.parse(raw);

  await db.crmLead.create({
    data: {
      tenantId: data.tenantId,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      source: "website_contact",
      status: "NEW",
      notes: `Subject: ${data.subject}\n\n${data.message}`,
    },
  });

  return { success: true };
}

// ── Newsletter Subscription ───────────────────────────────────────────────────

const newsletterSchema = z.object({
  tenantId: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
});

export async function subscribeNewsletter(
  raw: z.infer<typeof newsletterSchema>
) {
  const data = newsletterSchema.parse(raw);

  try {
    await db.newsletterSubscriber.create({
      data: {
        tenantId: data.tenantId,
        email: data.email,
        name: data.name ?? null,
        isActive: true,
      },
    });
    return { success: true, alreadySubscribed: false };
  } catch {
    // Unique constraint violation — already subscribed
    return { success: true, alreadySubscribed: true };
  }
}

// ── Review Submission (requires auth) ────────────────────────────────────────

const reviewSchema = z.object({
  tenantId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000).optional(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

export async function submitReview(raw: ReviewFormData) {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: "You must be logged in to leave a review." };
  }

  const data = reviewSchema.parse(raw);

  const existing = await db.review.findFirst({
    where: { tenantId: data.tenantId, userId: session.user.id },
  });

  if (existing) {
    await db.review.update({
      where: { id: existing.id },
      data: { rating: data.rating, comment: data.comment ?? null },
    });
  } else {
    await db.review.create({
      data: {
        tenantId: data.tenantId,
        userId: session.user.id,
        rating: data.rating,
        comment: data.comment ?? null,
        isPublic: true,
      },
    });
  }

  return { success: true };
}
