import { z } from "zod";
import {
  TenantModuleKey,
  type BusinessType,
  type SubscriptionPlan,
} from "@prisma/client";

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) return undefined;
  return value;
}

function normalizeOptionalUrl(value: unknown): unknown {
  const raw = emptyToUndefined(value);
  if (raw === undefined) return undefined;

  const str = String(raw).trim();
  if (!str) return undefined;
  if (/^https?:\/\//i.test(str)) return str;
  return `https://${str}`;
}

const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().email().optional()
);

const optionalUrl = z.preprocess(
  normalizeOptionalUrl,
  z.string().url().optional()
);

export const onboardingStep1Schema = z.object({
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
  businessName: z.string().min(2).max(100),
});

export const onboardingStep2Schema = z.object({
  logoUrl: z.string().url().nullable().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  fontFamily: z.string().optional(),
  headingFont: z.string().optional(),
});

export const onboardingStep3Schema = z.object({
  businessEmail: optionalEmail,
  businessPhone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  city: z.string().optional(),
  country: z.string().optional(),
  googleMapsUrl: optionalUrl,
});

export const onboardingStep4Schema = z.object({
  plan: z.enum(["FREE", "STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"]),
});

export const onboardingStep5Schema = z.object({
  modules: z.array(z.nativeEnum(TenantModuleKey)),
});

export const completeOnboardingSchema = z.object({
  tenantId: z.string(),
  step1: onboardingStep1Schema,
  step2: onboardingStep2Schema,
  step3: onboardingStep3Schema,
  step4: onboardingStep4Schema,
  step5: onboardingStep5Schema,
});

export type OnboardingData = {
  step1: z.infer<typeof onboardingStep1Schema>;
  step2: z.infer<typeof onboardingStep2Schema>;
  step3: z.infer<typeof onboardingStep3Schema>;
  step4: z.infer<typeof onboardingStep4Schema>;
  step5: { modules: TenantModuleKey[] };
};

export type { BusinessType, SubscriptionPlan };
