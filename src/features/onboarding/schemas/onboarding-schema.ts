import { z } from "zod";
import type { BusinessType } from "@prisma/client";

export const smartOnboardingSchema = z.object({
  tenantId: z.string(),
  businessType: z.enum([
    "FITNESS_COACH",
    "PERSONAL_TRAINER",
    "NUTRITION_COACH",
    "GYM",
    "FITNESS_ACADEMY",
    "FOOTBALL_COACH",
    "SWIMMING_COACH",
    "CROSSFIT_COACH",
    "YOGA_INSTRUCTOR",
    "PILATES_INSTRUCTOR",
    "BOXING_COACH",
    "MARTIAL_ARTS_COACH",
    "RUNNING_COACH",
    "CYCLING_COACH",
    "PHYSIOTHERAPIST",
    "REHABILITATION_CENTER",
    "SPORTS_CLINIC",
  ] as const),
  coachingSpecialty: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  language: z.string().min(2).max(50),
  businessName: z.string().min(2).max(100),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  businessEmail: z.string().email().optional(),
});

export type SmartOnboardingInput = z.infer<typeof smartOnboardingSchema>;

/** @deprecated Legacy multi-step schema — kept for migration compatibility */
export const completeOnboardingSchema = smartOnboardingSchema;

export type { BusinessType };
